package com.japaneselearning.mapper;

import com.japaneselearning.dto.ReviewItem;
import com.japaneselearning.entity.WordReview;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface WordReviewMapper {

    // 查某个词对某个用户的复习记录（首次学习时判断是否存在）
    @Select("SELECT * FROM word_review WHERE user_id = #{userId} AND word_id = #{wordId}")
    WordReview findByUserAndWord(@Param("userId") Integer userId, @Param("wordId") Integer wordId);

    // 查到期复习队列（due_date <= 今天），JOIN word 表一次拿全词义，一次最多 limit 个
    @Select("SELECT wr.id, wr.user_id, wr.word_id, wr.repetitions, wr.interval_days, wr.due_date, wr.last_reviewed_at, " +
            "w.word, w.kana, w.meaning, w.level " +
            "FROM word_review wr JOIN word w ON wr.word_id = w.id " +
            "WHERE wr.user_id = #{userId} AND wr.due_date <= #{today} " +
            "ORDER BY wr.due_date, wr.id LIMIT #{limit}")
    List<ReviewItem> findDueItems(@Param("userId") Integer userId, @Param("today") LocalDate today, @Param("limit") int limit);

    // 统计到期数量（进度条/仪表盘用）
    @Select("SELECT COUNT(*) FROM word_review WHERE user_id = #{userId} AND due_date <= #{today}")
    int countDueByUser(@Param("userId") Integer userId, @Param("today") LocalDate today);

    // 统计今日已复习数量（last_reviewed_at 属于今天）
    @Select("SELECT COUNT(*) FROM word_review WHERE user_id = #{userId} AND DATE(last_reviewed_at) = #{today}")
    int countReviewedToday(@Param("userId") Integer userId, @Param("today") LocalDate today);

    // 新增一条复习记录
    @Insert("INSERT INTO word_review(user_id, word_id, repetitions, interval_days, due_date, last_reviewed_at) " +
            "VALUES(#{userId}, #{wordId}, #{repetitions}, #{intervalDays}, #{dueDate}, #{lastReviewedAt})")
    int insert(WordReview review);

    // 更新复习结果（答对/答错后刷新次数、间隔、到期日）
    @Update("UPDATE word_review SET repetitions = #{repetitions}, interval_days = #{intervalDays}, " +
            "due_date = #{dueDate}, last_reviewed_at = #{lastReviewedAt} WHERE id = #{id}")
    int update(WordReview review);
}
