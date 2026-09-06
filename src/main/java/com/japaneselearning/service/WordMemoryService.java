package com.japaneselearning.service;

import com.japaneselearning.entity.WordMemory;

import java.util.List;

public interface WordMemoryService {

    // 単語の記憶状態をマーク（記録があれば更新、無ければ挿入）
    void mark(Integer userId, Integer wordId, String status);

    // 指定ユーザーの全記憶マークを取得
    List<WordMemory> listByUser(Integer userId);
}
