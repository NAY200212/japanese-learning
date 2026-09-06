package com.japaneselearning.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ExamRecord {
    private Integer id;              // 主キー
    private Integer userId;          // ユーザーID
    private String level;            // レベル N5/N4/N3
    private Integer totalScore;      // 合計点（0〜180）
    private Integer vocabScore;      // 文字語彙（0〜60）
    private Integer grammarScore;    // 文法（0〜60）
    private Integer readingScore;    // 読解（0〜60）
    private Integer correctCount;    // 正解問題数
    private Integer totalCount;      // 総問題数
    private LocalDateTime createdAt; // 作成日時
}
