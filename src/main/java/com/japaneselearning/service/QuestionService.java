package com.japaneselearning.service;

import com.japaneselearning.entity.Question;
import java.util.List;

public interface QuestionService {

    // 条件付きページングで問題を取得（level/type は空可）
    List<Question> findByCondition(String level, String type, int page, int size);

    // 条件付きで総数を集計
    int countByCondition(String level, String type);

    // ランダム出題
    List<Question> findRandom(String level, int count);

    Question findDetail(Integer id);

}
