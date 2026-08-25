package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WordMemory {
    private Integer id;
    private Integer userId;     // user_id → userId
    private Integer wordId;     // word_id → wordId
    private String status;      // 熟悉/模糊/陌生
    private LocalDateTime reviewedAt;  // reviewed_at → reviewedAt
}
