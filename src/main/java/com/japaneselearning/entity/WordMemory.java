package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WordMemory {
    private Integer id;
    private Integer userId;     // user_id → userId
    private Integer wordId;     // word_id → wordId
    private String status;      // 覚えている/あいまい/忘れた
    private LocalDateTime reviewedAt;  // reviewed_at → reviewedAt
}
