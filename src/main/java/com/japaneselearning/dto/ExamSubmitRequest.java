package com.japaneselearning.dto;

import lombok.Data;

import java.util.List;

@Data
public class ExamSubmitRequest {
    private String level;              // N5/N4/N3
    private List<SubmitAnswer> answers; // 答案列表
}
