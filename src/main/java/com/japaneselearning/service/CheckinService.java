package com.japaneselearning.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface CheckinService {
    // チェックイン：結果メッセージを返す（"チェックイン成功" または "今日はチェックイン済み"）
    String checkin(Integer userId);

    // 今日チェックイン済みかを取得
    boolean isCheckedToday(Integer userId);

    // 指定月のチェックイン日一覧を取得
    List<LocalDate> findMonth(Integer userId, String month);

    // 集計：総チェックイン日数 + 連続チェックイン日数
    Map<String, Object> stats(Integer userId);

}
