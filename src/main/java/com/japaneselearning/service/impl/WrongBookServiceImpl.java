package com.japaneselearning.service.impl;

import com.japaneselearning.entity.WrongBook;
import com.japaneselearning.mapper.WrongBookMapper;
import com.japaneselearning.service.WrongBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WrongBookServiceImpl implements WrongBookService {

    @Autowired
    private WrongBookMapper wrongBookMapper;

    @Override
    public List<WrongBook> listByUser(Integer userId) {
        return wrongBookMapper.listByUser(userId);
    }

    @Override
    public void markMastered(Integer userId, Integer questionId) {
        wrongBookMapper.markMastered(userId, questionId);
    }
}
