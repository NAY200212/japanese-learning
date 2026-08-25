package com.japaneselearning.service;

import com.japaneselearning.entity.User;

public interface UserService {

    // 注册：用户名存在返回 false，成功返回 true
    boolean register(String username, String password, String email);

    // 登录：用户名密码对则返回 User，否则返回 null
    User login(String username, String password);

    /** 根据 id 查用户（登录后获取个人信息用） */
    User findById(Long id);

}
