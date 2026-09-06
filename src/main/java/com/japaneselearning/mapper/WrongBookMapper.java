package com.japaneselearning.mapper;

import com.japaneselearning.entity.WrongBook;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface WrongBookMapper {

    // 指定ユーザー・指定問題が誤答ノートに既に存在するか確認
    @Select("SELECT * FROM wrong_book WHERE user_id = #{userId} AND question_id = #{questionId} LIMIT 1")
    WrongBook findByUserAndQuestion(@Param("userId") Integer userId, @Param("questionId") Integer questionId);

    // 初回誤答：挿入。既定 wrong_count=1、status=復習待ち
    @Insert("INSERT INTO wrong_book (user_id, question_id) VALUES (#{userId}, #{questionId})")
    int insert(@Param("userId") Integer userId, @Param("questionId") Integer questionId);

    // 再誤答：回数+1、日時を更新
    @Update("UPDATE wrong_book SET wrong_count = wrong_count + 1, status = '待复习', last_wrong_at = NOW() WHERE id = #{id}")
    int increaseWrong(@Param("id") Integer id);

    // 正解：正解回数+1
    @Update("UPDATE wrong_book SET right_count = right_count + 1 WHERE id = #{id}")
    int increaseRight(@Param("id") Integer id);

    // 誤答一覧：問題内容と JOIN。復習待ちのみ取得
    @Select("SELECT wb.id, wb.question_id, wb.wrong_count, wb.right_count, wb.status, wb.last_wrong_at, " +
            "q.content AS question_content, q.type AS question_type, q.level AS question_level " +
            "FROM wrong_book wb JOIN question q ON wb.question_id = q.id " +
            "WHERE wb.user_id = #{userId} AND wb.status = '待复习' " +
            "ORDER BY wb.last_wrong_at DESC " +
            "LIMIT #{offset}, #{size}")
    List<WrongBook> listByUserPage(@Param("userId") Integer userId, @Param("offset") int offset, @Param("size") int size);

    // 習得済みにマーク
    @Update("UPDATE wrong_book SET status = '已掌握' WHERE user_id = #{userId} AND question_id = #{questionId}")
    int markMastered(@Param("userId") Integer userId, @Param("questionId") Integer questionId);

    // 復習待ちの誤答数（ダッシュボード用）
    @Select("SELECT COUNT(*) FROM wrong_book WHERE user_id = #{userId} AND status = '待复习'")
    int countPendingByUser(@Param("userId") Integer userId);

    // 累計誤答回数（ダッシュボード用）
    @Select("SELECT COALESCE(SUM(wrong_count), 0) FROM wrong_book WHERE user_id = #{userId}")
    int sumWrongCountByUser(@Param("userId") Integer userId);


}
