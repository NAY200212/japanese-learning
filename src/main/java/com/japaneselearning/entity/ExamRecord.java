package com.japaneselearning.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExamRecord {
    private Integer id;              // 主键
    private Integer userId;          // 用户ID
    private String level;            // 等级 N5/N4/N3
    private Integer totalScore;      // 总分(0~180)
    private Integer vocabScore;      // 文字語彙(0~60)
    private Integer grammarScore;    // 文法(0~60)
    private Integer readingScore;    // 読解(0~60)
    private Integer correctCount;    // 答对题数
    private Integer totalCount;      // 总题数
    private LocalDateTime createdAt; // 创建时间
}
