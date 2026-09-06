package com.japaneselearning.mapper;

import com.japaneselearning.entity.Question;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QuestionMapper {

    // ページング検索：レベル + 問題タイプを任意で絞り込み
    @Select("<script>" +
            "SELECT * FROM question " +
            "WHERE 1=1 " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if> " +
            "<if test='type != null and type != \"\"'> AND type = #{type}</if> " +
            "ORDER BY id LIMIT #{offset}, #{size}" +
            "</script>")
    List<Question> findByCondition(@Param("level") String level,
                                   @Param("type") String type,
                                   @Param("offset") int offset,
                                   @Param("size") int size);

    // 総数（ページングに使用）
    @Select("<script>" +
            "SELECT COUNT(*) FROM question " +
            "WHERE 1=1 " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if> " +
            "<if test='type != null and type != \"\"'> AND type = #{type}</if>" +
            "</script>")
    int countByCondition(@Param("level") String level,
                         @Param("type") String type);

    // ランダム出題（模擬試験用）
    @Select("<script>" +
            "SELECT * FROM question " +
            "WHERE 1=1 " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if> " +
            "ORDER BY RAND() LIMIT #{count}" +
            "</script>")
    List<Question> findRandom(@Param("level") String level,
                              @Param("count") int count);

    // 指定レベルの全問題を取得（模擬試験の採点用）
    @Select("SELECT * FROM question WHERE level = #{level}")
    List<Question> findAllByLevel(@Param("level") String level);

    @Select("SELECT * FROM question WHERE id = #{id}")
    Question findById(@Param("id") Integer id);

    @Select("SELECT COUNT(*) FROM question")
    int countAll();
}
