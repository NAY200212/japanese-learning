package com.japaneselearning.service;

import com.japaneselearning.common.PageResult;
import com.japaneselearning.dto.ExamSubmitRequest;
import com.japaneselearning.entity.ExamRecord;

import java.util.Map;

public interface ExamService {

    // 提交试卷：判分 + 事务保存成绩单与答题明细，返回成绩单
    ExamRecord submit(Integer userId, ExamSubmitRequest request);

    // 分页查历史成绩
    PageResult<ExamRecord> records(Integer userId, String level, int page, int size);

    // 分项平均统计
    Map<String, Object> stats(Integer userId, String level);
}
