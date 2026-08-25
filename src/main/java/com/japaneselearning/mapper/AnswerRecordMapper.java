package com.japaneselearning.mapper;

import com.japaneselearning.entity.AnswerRecord;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AnswerRecordMapper {

    // 插入一条答题记录（answered_at 走数据库默认值，不用传）
    @Insert("INSERT INTO answer_record (user_id, question_id, is_correct, mode) " +
            "VALUES (#{userId}, #{questionId}, #{isCorrect}, #{mode})")
    int insert(AnswerRecord record);

    // 用户总答题数
    @Select("SELECT COUNT(*) FROM answer_record WHERE user_id = #{userId}")
    int countByUser(@Param("userId") Integer userId);

    // 用户答对数
    @Select("SELECT COUNT(*) FROM answer_record WHERE user_id = #{userId} AND is_correct = 1")
    int countCorrectByUser(@Param("userId") Integer userId);
}
