package com.japaneselearning.service.impl;

import com.japaneselearning.common.PageResult;
import com.japaneselearning.dto.ExamSubmitRequest;
import com.japaneselearning.dto.SubmitAnswer;
import com.japaneselearning.entity.ExamAnswer;
import com.japaneselearning.entity.ExamRecord;
import com.japaneselearning.entity.Question;
import com.japaneselearning.entity.QuestionOption;
import com.japaneselearning.mapper.ExamAnswerMapper;
import com.japaneselearning.mapper.ExamRecordMapper;
import com.japaneselearning.mapper.QuestionMapper;
import com.japaneselearning.mapper.QuestionOptionMapper;
import com.japaneselearning.service.ExamService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExamServiceImpl implements ExamService {

    // 构造器注入：依赖不可变，便于测试（替代字段 @Autowired）
    private final QuestionMapper questionMapper;
    private final QuestionOptionMapper questionOptionMapper;
    private final ExamRecordMapper examRecordMapper;
    private final ExamAnswerMapper examAnswerMapper;

    public ExamServiceImpl(QuestionMapper questionMapper,
                           QuestionOptionMapper questionOptionMapper,
                           ExamRecordMapper examRecordMapper,
                           ExamAnswerMapper examAnswerMapper) {
        this.questionMapper = questionMapper;
        this.questionOptionMapper = questionOptionMapper;
        this.examRecordMapper = examRecordMapper;
        this.examAnswerMapper = examAnswerMapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class) // 成绩单+明细要么都成功，要么都回滚
    public ExamRecord submit(Integer userId, ExamSubmitRequest request) {
        String level = request.getLevel();
        List<SubmitAnswer> answers = request.getAnswers();

        // 1. 查出该等级全部题目，建立 题目id -> 正确答案optionId 映射
        List<Question> questions = questionMapper.findAllByLevel(level);
        Map<Integer, Integer> correctMap = new HashMap<>();
        for (Question q : questions) {
            for (QuestionOption opt : questionOptionMapper.findByQuestionId(q.getId())) {
                if (Boolean.TRUE.equals(opt.getIsCorrect())) {
                    correctMap.put(q.getId(), opt.getId());
                    break;
                }
            }
        }

        // 2. 逐题判分，按题型分项统计（文字語彙/文法/読解）
        int vocabRight = 0, vocabTotal = 0;
        int grammarRight = 0, grammarTotal = 0;
        int readingRight = 0, readingTotal = 0;
        Map<Integer, Boolean> resultMap = new HashMap<>(); // questionId -> 是否答对
        Map<Integer, Integer> optionMap = new HashMap<>(); // questionId -> 用户选的optionId

        for (SubmitAnswer a : answers) {
            Question q = findQuestion(questions, a.getQuestionId());
            if (q == null) {
                continue;
            }
            Integer correctOpt = correctMap.get(q.getId());
            boolean correct = correctOpt != null && correctOpt.equals(a.getOptionId());
            resultMap.put(q.getId(), correct);
            optionMap.put(q.getId(), a.getOptionId());

            if (q.getType() != null && q.getType().contains("文字")) {
                vocabTotal++;
                if (correct) vocabRight++;
            } else if (q.getType() != null && q.getType().contains("文法")) {
                grammarTotal++;
                if (correct) grammarRight++;
            } else if (q.getType() != null && q.getType().contains("読解")) {
                readingTotal++;
                if (correct) readingRight++;
            }
        }

        // 3. 折算 180 分制：每项满分 60，按该项正确率折算
        int vocabScore = vocabTotal == 0 ? 0 : Math.round(vocabRight * 60f / vocabTotal);
        int grammarScore = grammarTotal == 0 ? 0 : Math.round(grammarRight * 60f / grammarTotal);
        int readingScore = readingTotal == 0 ? 0 : Math.round(readingRight * 60f / readingTotal);
        int totalScore = vocabScore + grammarScore + readingScore;
        int correctCount = vocabRight + grammarRight + readingRight;
        int totalCount = vocabTotal + grammarTotal + readingTotal;

        // 4. 保存成绩单（insert 后自动回填 record.id）
        ExamRecord record = new ExamRecord();
        record.setUserId(userId);
        record.setLevel(level);
        record.setTotalScore(totalScore);
        record.setVocabScore(vocabScore);
        record.setGrammarScore(grammarScore);
        record.setReadingScore(readingScore);
        record.setCorrectCount(correctCount);
        record.setTotalCount(totalCount);
        examRecordMapper.insert(record);

        // 5. 保存答题明细
        for (Map.Entry<Integer, Boolean> entry : resultMap.entrySet()) {
            ExamAnswer answer = new ExamAnswer();
            answer.setRecordId(record.getId());
            answer.setQuestionId(entry.getKey());
            answer.setOptionId(optionMap.get(entry.getKey()));
            answer.setIsCorrect(entry.getValue());
            examAnswerMapper.insert(answer);
        }

        return record;
    }

    @Override
    public PageResult<ExamRecord> records(Integer userId, String level, int page, int size) {
        int offset = (page - 1) * size;
        List<ExamRecord> list = examRecordMapper.findByUser(userId, level, offset, size);
        long total = examRecordMapper.countByUser(userId, level);
        return new PageResult<>(list, total, page, size);
    }

    @Override
    public Map<String, Object> stats(Integer userId, String level) {
        return examRecordMapper.statsByLevel(userId, level);
    }

    private Question findQuestion(List<Question> questions, Integer questionId) {
        for (Question q : questions) {
            if (q.getId().equals(questionId)) {
                return q;
            }
        }
        return null;
    }
}
