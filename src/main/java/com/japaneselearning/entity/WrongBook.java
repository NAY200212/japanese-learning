package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WrongBook {
    private Integer id;           // 主キー
    private Integer userId;       // ユーザーID
    private Integer questionId;   // 問題ID
    private Integer wrongCount;   // 累計誤答回数
    private Integer rightCount;   // 累計正解回数
    private String status;        // 復習待ち/習得済み
    private LocalDateTime lastWrongAt; // 直近の誤答日時
    // 以下の 3 フィールドは question テーブルとの JOIN 由来（表示専用）
    private String questionContent;
    private String questionType;
    private String questionLevel;

}
