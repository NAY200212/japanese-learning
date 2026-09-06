package com.japaneselearning.mapper;

import com.japaneselearning.dto.ReviewItem;
import com.japaneselearning.entity.WordReview;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface WordReviewMapper {

    // 指定単語・指定ユーザーの復習記録を取得（初回学習時の存在確認）
    @Select("SELECT * FROM word_review WHERE user_id = #{userId} AND word_id = #{wordId}")
    WordReview findByUserAndWord(@Param("userId") Integer userId, @Param("wordId") Integer wordId);

    // 復習期限到来キューを取得（due_date <= 今日）。word テーブルと JOIN して語義を一括取得、最大 limit 件
    @Select("SELECT wr.id, wr.user_id, wr.word_id, wr.repetitions, wr.interval_days, wr.due_date, wr.last_reviewed_at, " +
            "w.word, w.kana, w.meaning, w.level " +
            "FROM word_review wr JOIN word w ON wr.word_id = w.id " +
            "WHERE wr.user_id = #{userId} AND wr.due_date <= #{today} " +
            "ORDER BY wr.due_date, wr.id LIMIT #{limit}")
    List<ReviewItem> findDueItems(@Param("userId") Integer userId, @Param("today") LocalDate today, @Param("limit") int limit);

    // 復習期限到来数を集計（進捗バー/ダッシュボード用）
    @Select("SELECT COUNT(*) FROM word_review WHERE user_id = #{userId} AND due_date <= #{today}")
    int countDueByUser(@Param("userId") Integer userId, @Param("today") LocalDate today);

    // 今日の復習済み数を集計（last_reviewed_at が今日に属するもの）
    @Select("SELECT COUNT(*) FROM word_review WHERE user_id = #{userId} AND DATE(last_reviewed_at) = #{today}")
    int countReviewedToday(@Param("userId") Integer userId, @Param("today") LocalDate today);

    // 復習記録を 1 件追加
    @Insert("INSERT INTO word_review(user_id, word_id, repetitions, interval_days, due_date, last_reviewed_at) " +
            "VALUES(#{userId}, #{wordId}, #{repetitions}, #{intervalDays}, #{dueDate}, #{lastReviewedAt})")
    int insert(WordReview review);

    // 復習結果を反映（正解/不正解後に回数・間隔・期限日を更新）
    @Update("UPDATE word_review SET repetitions = #{repetitions}, interval_days = #{intervalDays}, " +
            "due_date = #{dueDate}, last_reviewed_at = #{lastReviewedAt} WHERE id = #{id}")
    int update(WordReview review);
}
