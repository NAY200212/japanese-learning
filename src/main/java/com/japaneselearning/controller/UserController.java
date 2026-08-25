package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.entity.User;
import com.japaneselearning.service.UserService;
import com.japaneselearning.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Tag(name = "用户管理", description = "注册与登录接口")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;   // 加在 userService 下面

    // 登录：POST /api/user/login
    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public Result<String> login(@RequestBody User user) {
        User loginUser = userService.login(user.getUsername(), user.getPassword());
        if (loginUser != null) {
            // 登录成功 → 签发 token 返回给前端
            String token = jwtUtil.generateToken(loginUser.getId(), loginUser.getUsername());
            return Result.success(token);
        }
        return Result.error("用户名或密码错误");
    }


    // 注册：POST /api/user/register
    @PostMapping("/register")
    @Operation(summary = "用户注册")
    public Result<String> register(@RequestBody User user) {
        boolean ok = userService.register(user.getUsername(), user.getPassword(), user.getEmail());
        if (ok) {
            return Result.success("注册成功");
        }
        return Result.error("用户名已存在");
    }

    // 当前登录用户信息：GET /api/user/me
    @GetMapping("/me")
    @Operation(summary = "当前用户信息")
    public Result<User> me(@RequestAttribute("userId") Long userId) {
        return Result.success(userService.findById(userId));
    }




}
