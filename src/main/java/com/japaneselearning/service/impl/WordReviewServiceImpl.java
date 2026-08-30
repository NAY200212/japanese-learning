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

    // SM-2 简化间隔表：连续答对 1~5 次后对应的复习间隔（天）
    private static final int[] SCHEDULE = {1, 3, 7, 14, 30};

    @Autowired
    private WordReviewMapper wordReviewMapper;

    @Override
    public List<ReviewItem> getDueList(Integer userId, int limit) {
        return wordReviewMapper.findDueItems(userId, LocalDate.now(), limit);
    }

    @Override
    public void submitReview(Integer userId, Integer wordId, int result) {
        // 1. 查该词对用户是否已有复习记录
        WordReview review = wordReviewMapper.findByUserAndWord(userId, wordId);
        if (review == null) {
            // 首次学习：建一条记录，明天第一次复习
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

        // 2. 已有记录：按结果重新计算间隔
        LocalDate today = LocalDate.now();
        int rep = review.getRepetitions() == null ? 0 : review.getRepetitions();

        if (result == 1) {
            // 记得：连续答对 +1，间隔按表拉长
            rep = Math.min(rep + 1, SCHEDULE.length); // 封顶 5
            review.setRepetitions(rep);
            review.setIntervalDays(SCHEDULE[rep - 1]);
            review.setDueDate(today.plusDays(review.getIntervalDays()));
        } else if (result == 2) {
            // 模糊：当作答对一半，间隔减半但不归零
            review.setRepetitions(rep);
            review.setIntervalDays(Math.max(1, review.getIntervalDays() / 2));
            review.setDueDate(today.plusDays(review.getIntervalDays()));
        } else {
            // 忘记：重置为 1 天，明天再复习
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
        // 今日已复习数：最后一次复习是今天的记录数（简化统计）
        stats.put("todayReviewed", wordReviewMapper.countReviewedToday(userId, today));
        return stats;
    }
}
