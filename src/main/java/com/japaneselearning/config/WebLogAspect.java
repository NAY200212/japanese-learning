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
    // ポイントカット：controller パッケージ配下の全メソッド
    @Pointcut("execution(* com.japaneselearning.controller..*.*(..))")
    public void controllerLog() {}
    private final ThreadLocal<Long> startTime = new ThreadLocal<>();

    // メソッド実行前
    @Before("controllerLog()")
    public void before(JoinPoint joinPoint) {
        log.info("before 执行了，方法名：{}", joinPoint.getSignature().getName());
        // 1. 開始時刻を記録
        startTime.set(System.currentTimeMillis());

    // 2. リクエストオブジェクトを取得（ServletRequestAttributes は Spring 提供の方式）
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs.getRequest();

    // 3. 出力：メソッド + パス + パラメータ
        log.info("[REQ] {} {} args={}", request.getMethod(),
                request.getRequestURI(), Arrays.toString(joinPoint.getArgs()));

    }

    // メソッド正常リターン後
    @AfterReturning("controllerLog()")
    public void afterReturning() {
        log.info("afterReturning 执行了");
        // 1. 所要時間を算出
        long cost = System.currentTimeMillis() - startTime.get();
    // 2. 出力
        log.info("[RES] 耗时={}ms", cost);
    // 3. 使い終わったらクリア（スレッドプールはスレッドを再利用するため、クリアしないとメモリリーク——面接ポイントでもある）
        startTime.remove();

    }

}
