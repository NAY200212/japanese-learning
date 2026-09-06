package com.japaneselearning.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WordReview {

    private Long id;                 // 主キー
    private Integer userId;          // ユーザーID
    private Integer wordId;          // 単語ID
    private Integer repetitions;     // 連続正解回数
    private Integer intervalDays;    // 現在の間隔（日）
    private LocalDate dueDate;       // 次回復習予定日
    private LocalDateTime lastReviewedAt; // 前回復習日時

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
}
