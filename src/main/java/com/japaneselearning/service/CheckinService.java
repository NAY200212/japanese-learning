package com.japaneselearning.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface CheckinService {
    // 打卡：返回结果消息（"打卡成功" 或 "今日已打卡"）
    String checkin(Integer userId);

    // 查询今天是否已打卡
    boolean isCheckedToday(Integer userId);

    // 查询某月已打卡日期列表
    List<LocalDate> findMonth(Integer userId, String month);

    // 统计：总打卡天数 + 连续打卡天数
    Map<String, Object> stats(Integer userId);

}
