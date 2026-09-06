package com.japaneselearning.service;

import java.util.List;

public interface KanaProgressService {

    // 指定ユーザーの習得済みかな一覧を取得
    List<String> listByUser(Integer userId);

    // 習得状態を設定：mastered=true なら追加、false なら解除
    void setMastered(Integer userId, String hiragana, boolean mastered);

    // 習得数を集計
    int countByUser(Integer userId);
}
