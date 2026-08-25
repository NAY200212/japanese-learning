package com.japaneselearning.service.impl;

import com.japaneselearning.entity.User;
import com.japaneselearning.mapper.UserMapper;
import com.japaneselearning.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    // BCrypt 密码加密器（不能明文存密码）
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public boolean register(String username, String password, String email) {
        // 1. 先查用户名是否已存在
        if (userMapper.findByUsername(username) != null) {
            return false;  // 用户名被占用
        }
        // 2. 密码加密后再存
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(password));  // 加密
        user.setEmail(email);
        userMapper.insert(user);
        return true;
    }

    @Override
    public User login(String username, String password) {
        // 1. 按用户名查用户
        User user = userMapper.findByUsername(username);
        if (user == null) {
            return null;  // 用户不存在
        }
        // 2. 密码比对（加密后的密码 matches）
        if (encoder.matches(password, user.getPassword())) {
            return user;  // 密码正确
        }
        return null;
    }

    @Override
    public User findById(Long id) {
        return userMapper.findById(id);
    }
}
