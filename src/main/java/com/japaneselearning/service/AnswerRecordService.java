package com.japaneselearning.service;

public interface AnswerRecordService {
    // 解答記録を 1 件送信
    void submit(Integer userId,Integer questionId,Boolean isCorrect,String mode);
}
