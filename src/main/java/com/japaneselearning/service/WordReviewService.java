package com.japaneselearning.service;

import com.japaneselearning.dto.ReviewItem;

import java.util.List;
import java.util.Map;

public interface WordReviewService {

    /**
     * 查当前用户的到期复习队列（due_date <= 今天）
     */
    List<ReviewItem> getDueList(Integer userId, int limit);

    /**
     * 提交一次复习结果
     * @param userId 用户ID
     * @param wordId 单词ID
     * @param result 0=忘记 1=记得 2=模糊
     */
    void submitReview(Integer userId, Integer wordId, int result);

    /**
     * 统计：今日待复习数 / 今日已复习数
     */
    Map<String, Object> getStats(Integer userId);
}
