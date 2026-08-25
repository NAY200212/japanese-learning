package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.entity.Kana;
import com.japaneselearning.service.KanaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kana")
@Tag(name = "五十音模块", description = "五十音表格与随机测试")
public class KanaController {

    @Autowired
    private KanaService kanaService;

    // 全部五十音
    @GetMapping("/list")
    @Operation(summary = "五十音列表")
    public Result<List<Kana>> list() {
        return Result.success(kanaService.getAll());
    }

    // 随机出题
    @GetMapping("/test")
    @Operation(summary = "随机出题")
    public Result<List<Kana>> test(@RequestParam(defaultValue = "10") int count) {
        return Result.success(kanaService.getRandom(count));
    }
}
