package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.service.CheckinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkin")
@Tag(name = "打卡管理", description = "每日打卡接口")
public class CheckinController {

    @Autowired
    private CheckinService checkinService;

    // POST /api/checkin 打卡
    @PostMapping
    @Operation(summary = "每日打卡")
    public Result<String> checkin(@RequestAttribute("userId") Integer userId) {
        return Result.success(checkinService.checkin(userId));
    }

    // GET /api/checkin/today 查今天是否已打卡
    @GetMapping("/today")
    @Operation(summary = "查询今日打卡状态")
    public Result<Boolean> today(@RequestAttribute("userId") Integer userId) {
        return Result.success(checkinService.isCheckedToday(userId));
    }

    // GET /api/checkin/month?month=2026-08 查某月已打卡日期
    @GetMapping("/month")
    @Operation(summary = "查询某月打卡日期列表")
    public Result<List<java.time.LocalDate>> month(@RequestParam("month") String month,
                                                  @RequestAttribute("userId") Integer userId) {
        return Result.success(checkinService.findMonth(userId, month));
    }

    // GET /api/checkin/stats 查总打卡天数 + 连续打卡天数
    @GetMapping("/stats")
    @Operation(summary = "打卡统计")
    public Result<Map<String, Object>> stats(@RequestAttribute("userId") Integer userId) {
        return Result.success(checkinService.stats(userId));
    }
}

