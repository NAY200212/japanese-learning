package com.japaneselearning.mapper;

import com.japaneselearning.entity.Checkin;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface CheckinMapper {
    @Select("select * from daily_checkin where user_id=#{userId} and checkin_date=#{checkinDate}")
    Checkin findByUserAndDate(@Param("userId")Integer userId, @Param("checkinDate") LocalDate checkinDate);


    @Insert("insert into daily_checkin(user_id,checkin_date,tasks_done,words_done)values(#{userId},#{checkinDate},#{tasksDone},#{wordsDone})")
    @Options(useGeneratedKeys = true,keyProperty = "id")
    int insert(Checkin checkin);

    // 查询某月已打卡的日期列表
// 参数：userId 用户ID, month 月份字符串，格式 "2026-08"
// 返回：该月所有 checkin_date，如 ["2026-08-24", "2026-08-25"]
    @Select("SELECT checkin_date FROM daily_checkin "
            + "WHERE user_id = #{userId} AND DATE_FORMAT(checkin_date, '%Y-%m') = #{month} "
            + "ORDER BY checkin_date")
    List<LocalDate> findByMonth(@Param("userId") Integer userId,
                                @Param("month") String month);

    // 查该用户全部打卡日期（按时间升序），用于统计连续天数
    @Select("SELECT checkin_date FROM daily_checkin WHERE user_id = #{userId} ORDER BY checkin_date")
    List<LocalDate> findAllDates(@Param("userId") Integer userId);

}
