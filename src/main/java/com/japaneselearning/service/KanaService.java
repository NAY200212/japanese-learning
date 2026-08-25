package com.japaneselearning.service;

import com.japaneselearning.entity.Kana;

import java.util.List;

public interface KanaService {
    /** 返回全部清音（46个） */
    List<Kana> getAll();

    /** 随机取 count 个假名，用于测试 */
    List<Kana> getRandom(int count);
}
