package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long id;            // ユーザーID（テーブルの id に対応）
    private String username;    // ユーザー名
    private String password;    // パスワード（BCrypt 暗号化後）
    private String email;       // メールアドレス
    private LocalDateTime createdAt;  // 登録日時
}
