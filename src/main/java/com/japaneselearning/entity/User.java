package com.japaneselearning.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long id;            // 用户ID，对应表里的 id
    private String username;    // 用户名
    private String password;    // 密码（BCrypt加密后）
    private String email;       // 邮箱
    private LocalDateTime createdAt;  // 注册时间
}
