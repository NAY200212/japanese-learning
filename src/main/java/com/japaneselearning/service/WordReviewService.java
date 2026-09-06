package com.japaneselearning.service;

import com.japaneselearning.dto.ReviewItem;

import java.util.List;
import java.util.Map;

public interface WordReviewService {

    /**
     * 現在のユーザーの復習期限到来キューを取得（due_date <= 今日）
     */
    List<ReviewItem> getDueList(Integer userId, int limit);

    /**
     * 復習結果を 1 回分送信
     * @param userId ユーザーID
     * @param wordId 単語ID
     * @param result 0=忘れた 1=覚えている 2=あいまい
     */
    void submitReview(Integer userId, Integer wordId, int result);

    /**
     * 集計：今日の復習予定数 / 今日の復習済み数
     */
    Map<String, Object> getStats(Integer userId);
}
