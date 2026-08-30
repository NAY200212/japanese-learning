package com.japaneselearning.dto;

import lombok.Data;

@Data
public class SubmitAnswer {
    private Integer questionId; // 题目ID
    private Integer optionId;   // 用户选择的选项ID
}
