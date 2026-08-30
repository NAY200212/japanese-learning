package com.japaneselearning.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.aspectj.lang.JoinPoint;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.util.Arrays;



@Aspect
@Component
@Slf4j
public class WebLogAspect {
    // 切点：controller 包下所有方法
    @Pointcut("execution(* com.japaneselearning.controller..*.*(..))")
    public void controllerLog() {}
    private final ThreadLocal<Long> startTime = new ThreadLocal<>();

    // 方法执行前
    @Before("controllerLog()")
    public void before(JoinPoint joinPoint) {
        log.info("before 执行了，方法名：{}", joinPoint.getSignature().getName());
        // 1. 记录开始时间
        startTime.set(System.currentTimeMillis());

    // 2. 拿请求对象（ServletRequestAttributes 是 Spring 提供的方式）
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs.getRequest();

    // 3. 打印：方法 + 路径 + 参数
        log.info("[REQ] {} {} args={}", request.getMethod(),
                request.getRequestURI(), Arrays.toString(joinPoint.getArgs()));

    }

    // 方法正常返回后
    @AfterReturning("controllerLog()")
    public void afterReturning() {
        log.info("afterReturning 执行了");
        // 1. 算耗时
        long cost = System.currentTimeMillis() - startTime.get();
    // 2. 打印
        log.info("[RES] 耗时={}ms", cost);
    // 3. 用完清掉（线程池会复用线程，不清会内存泄漏——这也是面试点）
        startTime.remove();

    }

}
