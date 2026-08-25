package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Question {
    private Integer id;              // 主键
    private String level;            // 等级 N5~N1
    private String type;             // 题型: 文字・語彙/読解/聴解
    private String content;          // 题干
    private String analysis;         // 解析
    private String audioUrl;         // 听力音频URL（可空）
    private LocalDateTime createdAt; // 创建时间
    private List<QuestionOption> options;
}
