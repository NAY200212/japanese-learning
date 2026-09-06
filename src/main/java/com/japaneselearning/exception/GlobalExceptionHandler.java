package com.japaneselearning.exception;

import com.japaneselearning.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 業務例外：自らスローしたもの。メッセージをそのまま表示に出す
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        return Result.error(e.getMessage());
    }

    // フォールバック：未知の例外。ログ出力 + 汎用メッセージ
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error("服务器开小差了，请稍后再试");
    }
}
