package com.japaneselearning.mapper;

import com.japaneselearning.entity.WordMemory;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface WordMemoryMapper {

    // 查某用户对某单词的记忆记录
    @Select("SELECT * FROM word_memory WHERE user_id = #{userId} AND word_id = #{wordId}")
    WordMemory findByUserAndWord(@Param("userId") Integer userId, @Param("wordId") Integer wordId);

    // 插入新记录
    @Insert("INSERT INTO word_memory (user_id, word_id, status) VALUES (#{userId}, #{wordId}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(WordMemory memory);

    // 更新状态
    @Update("UPDATE word_memory SET status = #{status}, reviewed_at = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Integer id, @Param("status") String status);

    // 查某用户全部记忆标记
    @Select("SELECT * FROM word_memory WHERE user_id = #{userId}")
    List<WordMemory> findByUser(@Param("userId") Integer userId);

    // 统计某用户各状态的数量（返回 [{status: familiar, count: 5}, ...]）
    @Select("SELECT status, COUNT(*) AS count FROM word_memory WHERE user_id = #{userId} GROUP BY status")
    List<Map<String, Object>> countByUser(@Param("userId") Integer userId);
}
