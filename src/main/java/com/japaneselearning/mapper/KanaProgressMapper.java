package com.japaneselearning.mapper;

import com.japaneselearning.entity.KanaProgress;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface KanaProgressMapper {

    // 指定ユーザーが習得済みの全かなを取得
    @Select("SELECT hiragana FROM kana_progress WHERE user_id = #{userId} ORDER BY id")
    List<String> findByUser(@Param("userId") Integer userId);

    // 習得記録を 1 件挿入（重複は無視）
    @Insert("INSERT IGNORE INTO kana_progress (user_id, hiragana) VALUES (#{userId}, #{hiragana})")
    int insert(@Param("userId") Integer userId, @Param("hiragana") String hiragana);

    // 習得を解除（記録を削除）
    @Delete("DELETE FROM kana_progress WHERE user_id = #{userId} AND hiragana = #{hiragana}")
    int delete(@Param("userId") Integer userId, @Param("hiragana") String hiragana);

    // 指定ユーザーの習得数を集計
    @Select("SELECT COUNT(*) FROM kana_progress WHERE user_id = #{userId}")
    int countByUser(@Param("userId") Integer userId);
}
