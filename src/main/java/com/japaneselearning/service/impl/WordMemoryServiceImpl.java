package com.japaneselearning.service.impl;

import com.japaneselearning.entity.WordMemory;
import com.japaneselearning.mapper.WordMemoryMapper;
import com.japaneselearning.service.WordMemoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WordMemoryServiceImpl implements WordMemoryService {

    @Autowired
    private WordMemoryMapper wordMemoryMapper;

    @Override
    public void mark(Integer userId, Integer wordId, String status) {
        // 1. 先查这个用户对这个词有没有记录
        WordMemory exist = wordMemoryMapper.findByUserAndWord(userId, wordId);
        if (exist != null) {
            // 2. 有记录 → 只更新状态（改 陌生 → 熟悉）
            wordMemoryMapper.updateStatus(exist.getId(), status);
        } else {
            // 3. 没记录 → 插入新记录
            WordMemory memory = new WordMemory();
            memory.setUserId(userId);
            memory.setWordId(wordId);
            memory.setStatus(status);
            wordMemoryMapper.insert(memory);
        }
    }

    @Override
    public List<WordMemory> listByUser(Integer userId) {
        return wordMemoryMapper.findByUser(userId);
    }
}
