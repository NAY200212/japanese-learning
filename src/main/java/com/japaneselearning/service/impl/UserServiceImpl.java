package com.japaneselearning.service.impl;

import com.japaneselearning.entity.User;
import com.japaneselearning.mapper.UserMapper;
import com.japaneselearning.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.japaneselearning.exception.BusinessException;


@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    // BCrypt パスワード暗号化器（パスワードの平文保存は禁止）
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public boolean register(String username, String password, String email) {
        // 1. まずユーザー名が既に存在するか確認
        if (userMapper.findByUsername(username) != null) {
            throw new BusinessException("用户名已存在");  // ユーザー名が使用中
        }
        // 2. パスワードを暗号化してから保存
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(password));  // 暗号化
        user.setEmail(email);
        userMapper.insert(user);
        return true;
    }

    @Override
    public User login(String username, String password) {
        // 1. ユーザー名でユーザーを検索
        User user = userMapper.findByUsername(username);
        if (user == null) {
            return null;  // ユーザーが存在しない
        }
        // 2. パスワードを照合（暗号化後のパスワードを matches で検証）
        if (encoder.matches(password, user.getPassword())) {
            return user;  // パスワード一致
        }
        return null;
    }

    @Override
    public User findById(Long id) {
        return userMapper.findById(id);
    }
}
