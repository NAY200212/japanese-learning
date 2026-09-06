package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Word {
    private Integer id;            // 主キー
    private String word;           // 日本語表記
    private String kana;           // 読み仮名（かな）
    private String meaning;        // 中国語の意味
    private String partOfSpeech;   // 品詞（空可）
    private String level;          // レベル N5〜N1
    private LocalDateTime createdAt; // 作成日時
}
