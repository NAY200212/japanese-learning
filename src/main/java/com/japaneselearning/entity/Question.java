package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Question {
    private Integer id;              // 主キー
    private String level;            // レベル N5〜N1
    private String type;             // 問題タイプ: 文字・語彙/読解/聴解
    private String content;          // 問題文
    private String analysis;         // 解説
    private String audioUrl;         // 聴解音声 URL（空可）
    private LocalDateTime createdAt; // 作成日時
    private List<QuestionOption> options;
}
