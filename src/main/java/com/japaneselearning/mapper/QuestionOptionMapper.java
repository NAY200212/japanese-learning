package com.japaneselearning.mapper;

import com.japaneselearning.entity.QuestionOption;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QuestionOptionMapper {

    // 按题目查它的 4 个选项
    @Select("SELECT * FROM question_option WHERE question_id = #{questionId}")
    List<QuestionOption> findByQuestionId(@Param("questionId") Integer questionId);
}
