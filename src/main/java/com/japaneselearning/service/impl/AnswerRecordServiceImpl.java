package com.japaneselearning.service.impl;

import com.japaneselearning.entity.AnswerRecord;
import com.japaneselearning.entity.WrongBook;
import com.japaneselearning.mapper.AnswerRecordMapper;
import com.japaneselearning.mapper.WrongBookMapper;
import com.japaneselearning.service.AnswerRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnswerRecordServiceImpl implements AnswerRecordService {

    @Autowired
    private AnswerRecordMapper answerRecordMapper;

    @Autowired
    private WrongBookMapper wrongBookMapper;

    @Override
    public void submit(Integer userId, Integer questionId, Boolean isCorrect, String mode) {
        // 1. 落答题记录
        AnswerRecord record = new AnswerRecord();
        record.setUserId(userId);
        record.setQuestionId(questionId);
        record.setIsCorrect(isCorrect);
        record.setMode(mode);
        answerRecordMapper.insert(record);

        // 2. 联动错题本
        WrongBook wb = wrongBookMapper.findByUserAndQuestion(userId, questionId);
        if (!isCorrect) {
            // 答错：不在本则新增，在本则错次数+1
            if (wb == null) {
                wrongBookMapper.insert(userId, questionId);
            } else {
                wrongBookMapper.increaseWrong(wb.getId());
            }
        } else if (wb != null) {
            // 答对且曾在错题本：对次数+1
            wrongBookMapper.increaseRight(wb.getId());
        }
    }
}
