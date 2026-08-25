package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Word {
    private Integer id;            // 主键
    private String word;           // 日语写法
    private String kana;           // 读音（假名）
    private String meaning;        // 中文释义
    private String partOfSpeech;   // 词性（可空）
    private String level;          // 等级 N5~N1
    private LocalDateTime createdAt; // 创建时间
}
