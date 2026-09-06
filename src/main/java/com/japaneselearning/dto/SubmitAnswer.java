package com.japaneselearning.dto;

import lombok.Data;

@Data
public class SubmitAnswer {
    private Integer questionId; // 問題ID
    private Integer optionId;   // ユーザーが選択した選択肢ID
}
