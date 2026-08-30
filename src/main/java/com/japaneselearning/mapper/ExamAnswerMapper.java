package com.japaneselearning.mapper;

import com.japaneselearning.entity.ExamAnswer;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ExamAnswerMapper {

    @Insert("INSERT INTO exam_answer(record_id, question_id, option_id, is_correct) " +
            "VALUES(#{recordId}, #{questionId}, #{optionId}, #{isCorrect})")
    int insert(ExamAnswer answer);
}
