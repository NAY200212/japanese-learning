package com.japaneselearning.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 復習期限が来た単語の表示オブジェクト：word_review JOIN word の結果
 */
public class ReviewItem {

    private Long id;                 // 復習記録ID
    private Integer userId;          // ユーザーID
    private Integer wordId;          // 単語ID
    private Integer repetitions;     // 連続正解回数
    private Integer intervalDays;    // 現在の間隔（日）
    private LocalDate dueDate;       // 次回復習予定日
    private LocalDateTime lastReviewedAt; // 前回復習日時

    // 以下は word テーブル由来のフィールド
    private String word;             // 日本語表記
    private String kana;             // 読み仮名
    private String meaning;          // 中国語の意味
    private String level;            // レベル N5〜N1

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getWordId() { return wordId; }
    public void setWordId(Integer wordId) { this.wordId = wordId; }

    public Integer getRepetitions() { return repetitions; }
    public void setRepetitions(Integer repetitions) { this.repetitions = repetitions; }

    public Integer getIntervalDays() { return intervalDays; }
    public void setIntervalDays(Integer intervalDays) { this.intervalDays = intervalDays; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getLastReviewedAt() { return lastReviewedAt; }
    public void setLastReviewedAt(LocalDateTime lastReviewedAt) { this.lastReviewedAt = lastReviewedAt; }

    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }

    public String getKana() { return kana; }
    public void setKana(String kana) { this.kana = kana; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
