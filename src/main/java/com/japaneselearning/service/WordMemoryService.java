package com.japaneselearning.service;

import com.japaneselearning.entity.WordMemory;

import java.util.List;

public interface WordMemoryService {

    // 标记单词记忆状态（有记录就更新，没有就插入）
    void mark(Integer userId, Integer wordId, String status);

    // 查某用户全部记忆标记
    List<WordMemory> listByUser(Integer userId);
}
