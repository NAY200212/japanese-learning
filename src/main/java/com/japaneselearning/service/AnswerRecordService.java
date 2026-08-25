package com.japaneselearning.service;

public interface AnswerRecordService {
    // 提交一条答题记录
    void submit(Integer userId,Integer questionId,Boolean isCorrect,String mode);
}
