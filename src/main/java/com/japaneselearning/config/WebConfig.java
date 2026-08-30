package com.japaneselearning.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    public WebConfig(JwtInterceptor jwtInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/user/me", "/api/word/memory", "/api/word/memory/list")   // 保护：这些接口要验 token
                .excludePathPatterns("/api/user/register", "/api/user/login") // 排除：注册登录不验
                .addPathPatterns("/api/checkin/**", "/api/kana/progress", "/api/dashboard/**")
                .addPathPatterns("/api/record/**", "/api/wrong/**")
                .addPathPatterns("/api/exam/**")
                .addPathPatterns("/api/review/**");


    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");

    }


}
