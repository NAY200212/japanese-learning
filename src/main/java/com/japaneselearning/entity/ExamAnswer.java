package com.japaneselearning.entity;

import lombok.Data;

@Data
public class ExamAnswer {
    private Integer id;         // 主キー
    private Integer recordId;   // 所属する成績表ID
    private Integer questionId; // 問題ID
    private Integer optionId;   // ユーザーが選んだ選択肢ID
    private Boolean isCorrect;  // 1=正解 0=不正解
}
