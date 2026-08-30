package com.japaneselearning.entity;

import lombok.Data;

@Data
public class ExamAnswer {
    private Integer id;         // 主键
    private Integer recordId;   // 所属成绩单ID
    private Integer questionId; // 题目ID
    private Integer optionId;   // 用户选的选项ID
    private Boolean isCorrect;  // 1=对 0=错
}
