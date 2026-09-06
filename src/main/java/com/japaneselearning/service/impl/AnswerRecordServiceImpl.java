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
        // 1. 解答記録を保存
        AnswerRecord record = new AnswerRecord();
        record.setUserId(userId);
        record.setQuestionId(questionId);
        record.setIsCorrect(isCorrect);
        record.setMode(mode);
        answerRecordMapper.insert(record);

        // 2. 誤答ノートと連携
        WrongBook wb = wrongBookMapper.findByUserAndQuestion(userId, questionId);
        if (!isCorrect) {
            // 誤答：ノートに無ければ新規追加、有れば誤答回数+1
            if (wb == null) {
                wrongBookMapper.insert(userId, questionId);
            } else {
                wrongBookMapper.increaseWrong(wb.getId());
            }
        } else if (wb != null) {
            // 正解かつ誤答ノートに存在：正解回数+1
            wrongBookMapper.increaseRight(wb.getId());
        }
    }
}
