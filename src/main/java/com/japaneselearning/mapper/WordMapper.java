package com.japaneselearning.mapper;

import com.japaneselearning.entity.Word;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WordMapper {
    @Select("select * from word where id=#{id}")
    Word findById(@Param("id") Integer id);

    @Select("<script>" +
            "SELECT * FROM word " +
            "WHERE 1=1 " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if> " +
            "ORDER BY id LIMIT #{offset}, #{size}" +
            "</script>")
    List<Word> findByLevel(@Param("level") String level,
                           @Param("offset") int offset,
                           @Param("size") int size);

    @Select("<script>" +
            "SELECT COUNT(*) FROM word " +
            "WHERE 1=1 " +
            "<if test='level != null and level != \"\"'> AND level = #{level}</if>" +
            "</script>")
    int countByLevel(@Param("level") String level);

}
