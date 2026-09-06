package com.japaneselearning.service;

import com.japaneselearning.entity.Kana;

import java.util.List;

public interface KanaService {
    /*全清音（46 個）を返す */
    List<Kana> getAll();

    /*ランダムに count 個の仮名を取得（テスト用） */
    List<Kana> getRandom(int count);
}
