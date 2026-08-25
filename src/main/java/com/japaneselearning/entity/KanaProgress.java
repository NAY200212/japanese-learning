package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class KanaProgress {
    private Integer id;          // 主键
    private Integer userId;      // user_id → userId
    private String hiragana;     // 已掌握的平假名
    private LocalDateTime createdAt;  // created_at → createdAt
}
