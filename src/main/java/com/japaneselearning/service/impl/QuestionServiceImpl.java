package com.japaneselearning.service.impl;

import com.japaneselearning.entity.Question;
import com.japaneselearning.mapper.QuestionMapper;
import com.japaneselearning.mapper.QuestionOptionMapper;
import com.japaneselearning.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {
    @Autowired
    private QuestionMapper questionMapper;

    @Autowired
    private QuestionOptionMapper questionOptionMapper;   // 新增注入

    @Override
    public List<Question> findByCondition(String level, String type, int page, int size) {
        int offset = (page - 1) * size;
        return questionMapper.findByCondition(level, type, offset, size);
    }

    @Override
    public int countByCondition(String level, String type) {
        return questionMapper.countByCondition(level, type);
    }

    @Override
    public List<Question> findRandom(String level, int count) {
        return questionMapper.findRandom(level, count);
    }

    @Override
    public Question findDetail(Integer id) {
        Question q = questionMapper.findById(id);
        if (q != null) {
            q.setOptions(questionOptionMapper.findByQuestionId(id));
        }
        return q;
    }
}
