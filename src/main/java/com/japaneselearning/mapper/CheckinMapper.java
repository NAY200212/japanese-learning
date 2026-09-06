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

    // 指定月にチェックイン済みの日付一覧を取得
// パラメータ：userId ユーザーID、month 月文字列（形式 "2026-08"）
// 戻り値：当月の全 checkin_date（例 ["2026-08-24", "2026-08-25"]）
    @Select("SELECT checkin_date FROM daily_checkin "
            + "WHERE user_id = #{userId} AND DATE_FORMAT(checkin_date, '%Y-%m') = #{month} "
            + "ORDER BY checkin_date")
    List<LocalDate> findByMonth(@Param("userId") Integer userId,
                                @Param("month") String month);

    // 対象ユーザーの全チェックイン日付を時間昇順で取得（連続日数の集計用）
    @Select("SELECT checkin_date FROM daily_checkin WHERE user_id = #{userId} ORDER BY checkin_date")
    List<LocalDate> findAllDates(@Param("userId") Integer userId);

}
