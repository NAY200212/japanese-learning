package com.japaneselearning.mapper;

import com.japaneselearning.entity.AnswerRecord;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AnswerRecordMapper {

    // 解答記録を 1 件挿入（answered_at は DB デフォルト値を使用するため送信不要）
    @Insert("INSERT INTO answer_record (user_id, question_id, is_correct, mode) " +
            "VALUES (#{userId}, #{questionId}, #{isCorrect}, #{mode})")
    int insert(AnswerRecord record);

    // ユーザーの総解答数
    @Select("SELECT COUNT(*) FROM answer_record WHERE user_id = #{userId}")
    int countByUser(@Param("userId") Integer userId);

    // ユーザーの正解数
    @Select("SELECT COUNT(*) FROM answer_record WHERE user_id = #{userId} AND is_correct = 1")
    int countCorrectByUser(@Param("userId") Integer userId);
}
