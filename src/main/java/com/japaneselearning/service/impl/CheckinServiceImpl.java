package com.japaneselearning.service.impl;


import com.japaneselearning.entity.Checkin;
import com.japaneselearning.mapper.CheckinMapper;
import com.japaneselearning.service.CheckinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class CheckinServiceImpl implements CheckinService {
    @Autowired
    private CheckinMapper checkinMapper;

    @Override
    public String checkin(Integer userId){
        Checkin exist = checkinMapper.findByUserAndDate(userId, LocalDate.now());
        if(exist != null) {
            return "今日已打卡";
        }
        Checkin checkin = new Checkin();
        checkin.setUserId(userId);
        checkin.setCheckinDate(LocalDate.now());
        checkin.setTasksDone(0);checkin.setWordsDone(0);
        checkinMapper.insert(checkin);
        return "打卡成功";

    }

    @Override
    public boolean isCheckedToday(Integer userId) {
            return checkinMapper.findByUserAndDate(userId, LocalDate.now()) != null;
        }

    @Override
    public List<LocalDate> findMonth(Integer userId, String month) {
        return checkinMapper.findByMonth(userId, month);
    }

    @Override
    public Map<String, Object> stats(Integer userId) {
        List<LocalDate> dates = checkinMapper.findAllDates(userId);
        Set<LocalDate> set = new HashSet<>(dates);

        // 连续打卡：从今天往前数，断档就停
        int consecutive = 0;
        LocalDate d = LocalDate.now();
        while (set.contains(d)) {
            consecutive++;
            d = d.minusDays(1);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("totalDays", dates.size());
        map.put("consecutiveDays", consecutive);
        return map;
    }

}
