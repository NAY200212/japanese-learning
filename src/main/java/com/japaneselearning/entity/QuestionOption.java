package com.japaneselearning.entity;

import lombok.Data;

@Data
public class QuestionOption {
    private Integer id;             // 主键
    private Integer questionId;     // 所属题目ID
    private String content;         // 选项内容
    private Boolean isCorrect;      // 是否正确答案（1=是 0=否）
}
