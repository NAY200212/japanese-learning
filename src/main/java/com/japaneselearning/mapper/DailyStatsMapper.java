package com.japaneselearning.mapper;

import com.japaneselearning.entity.DailyStats;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DailyStatsMapper {

    @Select("SELECT * FROM daily_stats WHERE user_id = #{userId} AND stat_date = #{statDate}")
    DailyStats findByUserAndDate(@Param("userId") Integer userId, @Param("statDate") LocalDate statDate);

    @Insert("INSERT INTO daily_stats(user_id, stat_date, word_count, exam_count, wrong_count, checkin_count) " +
            "VALUES(#{userId}, #{statDate}, #{wordCount}, #{examCount}, #{wrongCount}, #{checkinCount})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(DailyStats stats);

    @Update("UPDATE daily_stats SET word_count = #{wordCount}, exam_count = #{examCount}, " +
            "wrong_count = #{wrongCount}, checkin_count = #{checkinCount} WHERE id = #{id}")
    int update(DailyStats stats);

    // 当天有学习活动的用户列表（打卡/考试/错题 三表去重）
    @Select("SELECT DISTINCT user_id FROM daily_checkin " +
            "UNION SELECT DISTINCT user_id FROM exam_record " +
            "UNION SELECT DISTINCT user_id FROM wrong_book")
    List<Integer> findActiveUserIds();

    @Select("SELECT COUNT(*) FROM daily_checkin WHERE user_id = #{userId} AND checkin_date = #{date}")
    int countCheckin(@Param("userId") Integer userId, @Param("date") LocalDate date);

    @Select("SELECT COUNT(*) FROM exam_record WHERE user_id = #{userId} AND DATE(created_at) = #{date}")
    int countExam(@Param("userId") Integer userId, @Param("date") LocalDate date);

    @Select("SELECT COUNT(*) FROM wrong_book WHERE user_id = #{userId} AND DATE(last_wrong_at) = #{date}")
    int countWrong(@Param("userId") Integer userId, @Param("date") LocalDate date);

    @Select("SELECT COUNT(*) FROM word_memory WHERE user_id = #{userId} AND DATE(reviewed_at) = #{date}")
    int countWord(@Param("userId") Integer userId, @Param("date") LocalDate date);
}
