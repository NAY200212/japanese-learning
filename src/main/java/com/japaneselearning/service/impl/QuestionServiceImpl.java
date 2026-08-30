package com.japaneselearning.service.impl;

import com.japaneselearning.entity.Question;
import com.japaneselearning.mapper.QuestionMapper;
import com.japaneselearning.mapper.QuestionOptionMapper;
import com.japaneselearning.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {
    @Autowired
    private QuestionMapper questionMapper;

    @Autowired
    private QuestionOptionMapper questionOptionMapper;   // 新增注入

    @Override
    @Cacheable(cacheNames = "question:list",key = "'level:' + (#level ?: 'ALL') + ':type:' + (#type ?: 'ALL') +':page:' + #page + ':size:' + #size")
    public List<Question> findByCondition(String level, String type, int page, int size) {
        int offset = (page - 1) * size;
        return questionMapper.findByCondition(level, type, offset, size);
    }

    @Override
    @Cacheable(cacheNames = "question:count", key = "'level:' + (#level ?: 'ALL') + ':type:' + (#type ?: 'ALL')")
    public int countByCondition(String level, String type) {
        return questionMapper.countByCondition(level, type);
    }

    @Override
    public List<Question> findRandom(String level, int count) {
        // 随机抽题不缓存：每次应返回不同题目，缓存会破坏随机性
        return questionMapper.findRandom(level, count);
    }

    @Override
    @Cacheable(cacheNames = "question:detail",key = "#id")
    public Question findDetail(Integer id) {
        Question q = questionMapper.findById(id);
        if (q != null) {
            q.setOptions(questionOptionMapper.findByQuestionId(id));
        }
        return q;
    }
}
