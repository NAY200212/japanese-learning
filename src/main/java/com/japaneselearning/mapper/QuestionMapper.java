package com.japaneselearning.mapper;

import com.japaneselearning.entity.Question;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QuestionMapper {

    // 分页查询：等级+题型可选过滤
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

    // 总数（分页要用）
    @Select("<script>" +
            "SELECT COUNT(*) FROM question " +
            "WHERE 1=1 " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if> " +
            "<if test='type != null and type != \"\"'> AND type = #{type}</if>" +
            "</script>")
    int countByCondition(@Param("level") String level,
                         @Param("type") String type);

    // 随机抽题（模拟考试用）
    @Select("<script>" +
            "SELECT * FROM question " +
            "WHERE 1=1 " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if> " +
            "ORDER BY RAND() LIMIT #{count}" +
            "</script>")
    List<Question> findRandom(@Param("level") String level,
                              @Param("count") int count);

    @Select("SELECT * FROM question WHERE id = #{id}")
    Question findById(@Param("id") Integer id);

    @Select("SELECT COUNT(*) FROM question")
    int countAll();
}
