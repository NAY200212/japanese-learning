package com.japaneselearning.service.impl;

import com.japaneselearning.dto.ReviewItem;
import com.japaneselearning.entity.WordReview;
import com.japaneselearning.mapper.WordReviewMapper;
import com.japaneselearning.service.WordReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WordReviewServiceImpl implements WordReviewService {

    // SM-2 簡易間隔表：連続正解 1〜5 回後に応じた復習間隔（日）
    private static final int[] SCHEDULE = {1, 3, 7, 14, 30};

    @Autowired
    private WordReviewMapper wordReviewMapper;

    @Override
    public List<ReviewItem> getDueList(Integer userId, int limit) {
        return wordReviewMapper.findDueItems(userId, LocalDate.now(), limit);
    }

    @Override
    public void submitReview(Integer userId, Integer wordId, int result) {
        // 1. 対象単語の復習記録がユーザーに既にあるか確認
        WordReview review = wordReviewMapper.findByUserAndWord(userId, wordId);
        if (review == null) {
            // 初回学習：記録を新規作成し、翌日に初回復習
            review = new WordReview();
            review.setUserId(userId);
            review.setWordId(wordId);
            review.setRepetitions(0);
            review.setIntervalDays(1);
            review.setDueDate(LocalDate.now().plusDays(1));
            review.setLastReviewedAt(LocalDateTime.now());
            wordReviewMapper.insert(review);
            return;
        }

        // 2. 記録あり：結果に応じて間隔を再計算
        LocalDate today = LocalDate.now();
        int rep = review.getRepetitions() == null ? 0 : review.getRepetitions();

        if (result == 1) {
            // 覚えている：連続正解 +1、間隔を表に沿って延長
            rep = Math.min(rep + 1, SCHEDULE.length); // 上限 5
            review.setRepetitions(rep);
            review.setIntervalDays(SCHEDULE[rep - 1]);
            review.setDueDate(today.plusDays(review.getIntervalDays()));
        } else if (result == 2) {
            // あいまい：半分正解として扱い、間隔を半分にするがゼロにはしない
            review.setRepetitions(rep);
            review.setIntervalDays(Math.max(1, review.getIntervalDays() / 2));
            review.setDueDate(today.plusDays(review.getIntervalDays()));
        } else {
            // 忘れた：1 日にリセットし、翌日また復習
            review.setRepetitions(0);
            review.setIntervalDays(1);
            review.setDueDate(today.plusDays(1));
        }
        review.setLastReviewedAt(LocalDateTime.now());
        wordReviewMapper.update(review);
    }

    @Override
    public Map<String, Object> getStats(Integer userId) {
        LocalDate today = LocalDate.now();
        Map<String, Object> stats = new HashMap<>();
        stats.put("dueCount", wordReviewMapper.countDueByUser(userId, today));
        // 今日の復習済み数：最終復習が今日の記録数（簡易集計）
        stats.put("todayReviewed", wordReviewMapper.countReviewedToday(userId, today));
        return stats;
    }
}
