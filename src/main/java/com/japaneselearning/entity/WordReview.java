package com.japaneselearning.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WordReview {

    private Long id;                 // 主键
    private Integer userId;          // 用户ID
    private Integer wordId;          // 单词ID
    private Integer repetitions;     // 连续答对次数
    private Integer intervalDays;    // 当前间隔（天）
    private LocalDate dueDate;       // 下次到期日
    private LocalDateTime lastReviewedAt; // 上次复习时间

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
