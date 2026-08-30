package com.japaneselearning.mapper;

import com.japaneselearning.entity.ExamRecord;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface ExamRecordMapper {

    @Insert("INSERT INTO exam_record(user_id, level, total_score, vocab_score, grammar_score, reading_score, correct_count, total_count) " +
            "VALUES(#{userId}, #{level}, #{totalScore}, #{vocabScore}, #{grammarScore}, #{readingScore}, #{correctCount}, #{totalCount})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(ExamRecord record);

    // 分页查历史成绩（按时间倒序）
    @Select("<script>" +
            "SELECT * FROM exam_record WHERE user_id = #{userId} " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if> " +
            "ORDER BY id DESC LIMIT #{offset}, #{size}" +
            "</script>")
    List<ExamRecord> findByUser(@Param("userId") Integer userId,
                                @Param("level") String level,
                                @Param("offset") int offset,
                                @Param("size") int size);

    @Select("<script>" +
            "SELECT COUNT(*) FROM exam_record WHERE user_id = #{userId} " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if>" +
            "</script>")
    long countByUser(@Param("userId") Integer userId,
                     @Param("level") String level);

    // 分项平均分统计（趋势图/仪表盘用）
    @Select("SELECT COUNT(*) AS totalCount, " +
            "COALESCE(AVG(total_score),0) AS avgTotal, " +
            "COALESCE(AVG(vocab_score),0) AS avgVocab, " +
            "COALESCE(AVG(grammar_score),0) AS avgGrammar, " +
            "COALESCE(AVG(reading_score),0) AS avgReading " +
            "FROM exam_record WHERE user_id = #{userId} AND level = #{level}")
    Map<String, Object> statsByLevel(@Param("userId") Integer userId,
                                     @Param("level") String level);
}
