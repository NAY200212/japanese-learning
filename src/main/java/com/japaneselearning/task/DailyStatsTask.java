package com.japaneselearning.task;

import com.japaneselearning.service.DailyStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.function.ToDoubleFunction;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyStatsTask {

    private final DailyStatsService dailyStatsService;

    // cron：秒 分 時 日 月 曜日 → 毎日 23:50 に実行
    @Scheduled(cron = "0 50 23 * * ?")
    public void generateDailyStats() {
        dailyStatsService.generateTodayStats();
    }
}
