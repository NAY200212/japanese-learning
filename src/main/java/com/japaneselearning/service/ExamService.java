package com.japaneselearning.service;

import com.japaneselearning.common.PageResult;
import com.japaneselearning.dto.ExamSubmitRequest;
import com.japaneselearning.entity.ExamRecord;

import java.util.Map;

public interface ExamService {

    // 答案提出：採点 + トランザクションで成績表と解答明細を保存し、成績表を返す
    ExamRecord submit(Integer userId, ExamSubmitRequest request);

    // 履歴成績をページング取得
    PageResult<ExamRecord> records(Integer userId, String level, int page, int size);

    // セクション別平均の集計
    Map<String, Object> stats(Integer userId, String level);
}
