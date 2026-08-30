package com.japaneselearning.entity;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DailyStats {
    private Integer id;
    private Integer userId;
    private LocalDate statDate;
    private Integer wordCount;
    private Integer examCount;
    private Integer wrongCount;
    private Integer checkinCount;
    private LocalDateTime createdAt;
}
