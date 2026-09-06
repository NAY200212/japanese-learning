package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnswerRecord {
    private Integer id;            // 主キー
    private Integer userId;        // ユーザーID
    private Integer questionId;    // 問題ID
    private Boolean isCorrect;     // 正解かどうか（1=正解 0=不正解）
    private String mode;           // モード: practice/exam
    private LocalDateTime answeredAt; // 解答日時
}
