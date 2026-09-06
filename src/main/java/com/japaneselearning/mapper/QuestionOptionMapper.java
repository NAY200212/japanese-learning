package com.japaneselearning.mapper;

import com.japaneselearning.entity.QuestionOption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QuestionOptionMapper {

    // 問題に紐づく 4 つの選択肢を取得
    @Select("SELECT * FROM question_option WHERE question_id = #{questionId}")
    List<QuestionOption> findByQuestionId(@Param("questionId") Integer questionId);
}
