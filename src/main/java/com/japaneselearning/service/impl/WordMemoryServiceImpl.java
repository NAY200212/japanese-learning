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
        // 1. このユーザーがこの単語の記録を持っているか確認
        WordMemory exist = wordMemoryMapper.findByUserAndWord(userId, wordId);
        if (exist != null) {
            // 2. 記録あり → 状態のみ更新（例：忘れた → 覚えている）
            wordMemoryMapper.updateStatus(exist.getId(), status);
        } else {
            // 3. 記録なし → 新規挿入
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
