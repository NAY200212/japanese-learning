package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class KanaProgress {
    private Integer id;          // 主キー
    private Integer userId;      // user_id → userId
    private String hiragana;     // 習得済みの平仮名
    private LocalDateTime createdAt;  // created_at → createdAt
}
