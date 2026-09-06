package com.japaneselearning.mapper;

import com.japaneselearning.entity.WordMemory;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface WordMemoryMapper {

    // 指定ユーザー・指定単語の記憶記録を取得
    @Select("SELECT * FROM word_memory WHERE user_id = #{userId} AND word_id = #{wordId}")
    WordMemory findByUserAndWord(@Param("userId") Integer userId, @Param("wordId") Integer wordId);

    // 新規記録を挿入
    @Insert("INSERT INTO word_memory (user_id, word_id, status) VALUES (#{userId}, #{wordId}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(WordMemory memory);

    // 状態を更新
    @Update("UPDATE word_memory SET status = #{status}, reviewed_at = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Integer id, @Param("status") String status);

    // 指定ユーザーの全記憶マークを取得
    @Select("SELECT * FROM word_memory WHERE user_id = #{userId}")
    List<WordMemory> findByUser(@Param("userId") Integer userId);

    // 指定ユーザーの状態別件数を集計（戻り値: [{status: familiar, count: 5}, ...]）
    @Select("SELECT status, COUNT(*) AS count FROM word_memory WHERE user_id = #{userId} GROUP BY status")
    List<Map<String, Object>> countByUser(@Param("userId") Integer userId);
}
