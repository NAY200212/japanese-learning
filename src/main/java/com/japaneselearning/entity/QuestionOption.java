package com.japaneselearning.entity;

import lombok.Data;

@Data
public class QuestionOption {
    private Integer id;             // 主キー
    private Integer questionId;     // 所属問題ID
    private String content;         // 選択肢の内容
    private Boolean isCorrect;      // 正解かどうか（1=はい 0=いいえ）
}
