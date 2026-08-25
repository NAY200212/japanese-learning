package com.japaneselearning.service;

import com.japaneselearning.entity.Question;
import java.util.List;

public interface QuestionService {

    // 条件分页查题目（level/type 可空）
    List<Question> findByCondition(String level, String type, int page, int size);

    // 条件统计总数
    int countByCondition(String level, String type);

    // 随机抽题
    List<Question> findRandom(String level, int count);

    Question findDetail(Integer id);

}
