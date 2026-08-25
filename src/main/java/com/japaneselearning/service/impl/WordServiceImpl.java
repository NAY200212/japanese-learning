package com.japaneselearning.service.impl;

import com.japaneselearning.entity.Word;
import com.japaneselearning.mapper.WordMapper;
import com.japaneselearning.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WordServiceImpl implements WordService {

    @Autowired
    private WordMapper wordMapper;

    @Override
    public List<Word> findByLevel(String level, int page, int size) {
        int offset = (page - 1) * size;  // 页码转偏移量
        return wordMapper.findByLevel(level, offset, size);
    }

    @Override
    public int countByLevel(String level) {
        return wordMapper.countByLevel(level);
    }

    @Override
    public Word findById(Integer id) {
        return wordMapper.findById(id);
    }

}
