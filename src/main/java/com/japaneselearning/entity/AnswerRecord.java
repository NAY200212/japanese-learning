package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnswerRecord {
    private Integer id;            // 主键
    private Integer userId;        // 用户ID
    private Integer questionId;    // 题目ID
    private Boolean isCorrect;     // 是否答对（1=对 0=错）
    private String mode;           // 模式: practice/exam
    private LocalDateTime answeredAt; // 答题时间
}
