package com.japaneselearning.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 到期复习词展示对象：word_review JOIN word 的结果
 */
public class ReviewItem {

    private Long id;                 // 复习记录ID
    private Integer userId;          // 用户ID
    private Integer wordId;          // 单词ID
    private Integer repetitions;     // 连续答对次数
    private Integer intervalDays;    // 当前间隔（天）
    private LocalDate dueDate;       // 下次到期日
    private LocalDateTime lastReviewedAt; // 上次复习时间

    // 以下来自 word 表
    private String word;             // 日语写法
    private String kana;             // 读音
    private String meaning;          // 中文释义
    private String level;            // 等级 N5~N1

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
