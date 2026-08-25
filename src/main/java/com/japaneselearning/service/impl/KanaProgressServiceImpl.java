package com.japaneselearning.service.impl;

import com.japaneselearning.mapper.KanaProgressMapper;
import com.japaneselearning.service.KanaProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KanaProgressServiceImpl implements KanaProgressService {

    @Autowired
    private KanaProgressMapper kanaProgressMapper;

    @Override
    public List<String> listByUser(Integer userId) {
        return kanaProgressMapper.findByUser(userId);
    }

    @Override
    public void setMastered(Integer userId, String hiragana, boolean mastered) {
        if (mastered) {
            kanaProgressMapper.insert(userId, hiragana);
        } else {
            kanaProgressMapper.delete(userId, hiragana);
        }
    }

    @Override
    public int countByUser(Integer userId) {
        return kanaProgressMapper.countByUser(userId);
    }
}
