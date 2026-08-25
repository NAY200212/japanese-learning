package com.japaneselearning.mapper;

import com.japaneselearning.entity.KanaProgress;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface KanaProgressMapper {

    // 查某用户已掌握的全部假名
    @Select("SELECT hiragana FROM kana_progress WHERE user_id = #{userId} ORDER BY id")
    List<String> findByUser(@Param("userId") Integer userId);

    // 插入一条掌握记录（重复则忽略）
    @Insert("INSERT IGNORE INTO kana_progress (user_id, hiragana) VALUES (#{userId}, #{hiragana})")
    int insert(@Param("userId") Integer userId, @Param("hiragana") String hiragana);

    // 取消掌握（删除记录）
    @Delete("DELETE FROM kana_progress WHERE user_id = #{userId} AND hiragana = #{hiragana}")
    int delete(@Param("userId") Integer userId, @Param("hiragana") String hiragana);

    // 统计某用户掌握数量
    @Select("SELECT COUNT(*) FROM kana_progress WHERE user_id = #{userId}")
    int countByUser(@Param("userId") Integer userId);
}
