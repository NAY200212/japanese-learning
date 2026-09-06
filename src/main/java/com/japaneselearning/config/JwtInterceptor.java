package com.japaneselearning.config;

import com.japaneselearning.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public JwtInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // CORS プリフライトリクエストを許可
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        // 1. Authorization ヘッダーを取得。形式は "Bearer <token>"
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            return false;
        }
        // 2. "Bearer " プレフィックス（7 文字）を除去
        String token = authHeader.substring(7);
        // 3. token を検証し、userId を request に格納
        try {
            Long userId = jwtUtil.getUserIdFromToken(token);
            request.setAttribute("userId", userId);
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            return false;
        }
    }
}
