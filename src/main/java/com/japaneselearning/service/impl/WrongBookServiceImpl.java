package com.japaneselearning.service.impl;

import com.japaneselearning.common.PageResult;
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
        return wrongBookMapper.listByUserPage(userId, 0, Integer.MAX_VALUE);
    }

    @Override
    public PageResult<WrongBook> pageByUser(Integer userId, int page, int size) {
        int offset = (page - 1) * size;
        List<WrongBook> list = wrongBookMapper.listByUserPage(userId, offset, size);
        int total = wrongBookMapper.countPendingByUser(userId);
        return new PageResult<>(list, total, page, size);
    }

    @Override
    public void markMastered(Integer userId, Integer questionId) {
        wrongBookMapper.markMastered(userId, questionId);
    }
}
