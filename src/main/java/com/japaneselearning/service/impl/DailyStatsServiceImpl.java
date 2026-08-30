package com.japaneselearning.service.impl;

import com.japaneselearning.entity.DailyStats;
import com.japaneselearning.mapper.DailyStatsMapper;
import com.japaneselearning.service.DailyStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyStatsServiceImpl implements DailyStatsService {

    private final DailyStatsMapper dailyStatsMapper;

    @Override
    @Transactional
    public void generateTodayStats() {
        LocalDate today = LocalDate.now();
        List<Integer> userIds = dailyStatsMapper.findActiveUserIds();

        for (Integer userId : userIds) {
            DailyStats stats = dailyStatsMapper.findByUserAndDate(userId, today);
            if (stats == null) {
                stats = new DailyStats();
                stats.setUserId(userId);
                stats.setStatDate(today);
                stats.setWordCount(dailyStatsMapper.countWord(userId, today));
                stats.setCheckinCount(dailyStatsMapper.countCheckin(userId, today));
                stats.setExamCount(dailyStatsMapper.countExam(userId, today));
                stats.setWrongCount(dailyStatsMapper.countWrong(userId, today));
                dailyStatsMapper.insert(stats);
            } else {
                stats.setWordCount(dailyStatsMapper.countWord(userId, today));
                stats.setCheckinCount(dailyStatsMapper.countCheckin(userId, today));
                stats.setExamCount(dailyStatsMapper.countExam(userId, today));
                stats.setWrongCount(dailyStatsMapper.countWrong(userId, today));
                dailyStatsMapper.update(stats);
            }
        }
        log.info("每日学习统计完成，共统计 {} 个活跃用户", userIds.size());
    }
}
