package com.japaneselearning.mapper;

import com.japaneselearning.entity.WrongBook;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface WrongBookMapper {

    // 查某用户某题是否已在错题本
    @Select("SELECT * FROM wrong_book WHERE user_id = #{userId} AND question_id = #{questionId} LIMIT 1")
    WrongBook findByUserAndQuestion(@Param("userId") Integer userId, @Param("questionId") Integer questionId);

    // 首次答错：插入，默认 wrong_count=1、status=待复习
    @Insert("INSERT INTO wrong_book (user_id, question_id) VALUES (#{userId}, #{questionId})")
    int insert(@Param("userId") Integer userId, @Param("questionId") Integer questionId);

    // 重复答错：次数+1，刷新时间
    @Update("UPDATE wrong_book SET wrong_count = wrong_count + 1, status = '待复习', last_wrong_at = NOW() WHERE id = #{id}")
    int increaseWrong(@Param("id") Integer id);

    // 答对：答对次数+1
    @Update("UPDATE wrong_book SET right_count = right_count + 1 WHERE id = #{id}")
    int increaseRight(@Param("id") Integer id);

    // 错题列表：JOIN 题目内容，只查待复习
    @Select("SELECT wb.id, wb.question_id, wb.wrong_count, wb.right_count, wb.status, wb.last_wrong_at, " +
            "q.content AS question_content, q.type AS question_type, q.level AS question_level " +
            "FROM wrong_book wb JOIN question q ON wb.question_id = q.id " +
            "WHERE wb.user_id = #{userId} AND wb.status = '待复习' " +
            "ORDER BY wb.last_wrong_at DESC " +
            "LIMIT #{offset}, #{size}")
    List<WrongBook> listByUserPage(@Param("userId") Integer userId, @Param("offset") int offset, @Param("size") int size);

    // 标记已掌握
    @Update("UPDATE wrong_book SET status = '已掌握' WHERE user_id = #{userId} AND question_id = #{questionId}")
    int markMastered(@Param("userId") Integer userId, @Param("questionId") Integer questionId);

    // 待复习错题数（仪表盘用）
    @Select("SELECT COUNT(*) FROM wrong_book WHERE user_id = #{userId} AND status = '待复习'")
    int countPendingByUser(@Param("userId") Integer userId);

    // 累计错误次数（仪表盘用）
    @Select("SELECT COALESCE(SUM(wrong_count), 0) FROM wrong_book WHERE user_id = #{userId}")
    int sumWrongCountByUser(@Param("userId") Integer userId);


}
