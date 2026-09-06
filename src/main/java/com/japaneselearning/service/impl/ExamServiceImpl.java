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

    // コンストラクタインジェクション：依存を不変にしテストを容易にする（フィールド @Autowired の代替）
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
    @Transactional(rollbackFor = Exception.class) // 成績表と明細は両方成功するか両方ロールバックする
    public ExamRecord submit(Integer userId, ExamSubmitRequest request) {
        String level = request.getLevel();
        List<SubmitAnswer> answers = request.getAnswers();

        // 1. 指定レベルの全問題を取得し、問題id → 正解選択肢optionId のマップを作成
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

        // 2. 問題ごとに採点し、タイプ別に集計（文字語彙/文法/読解）
        int vocabRight = 0, vocabTotal = 0;
        int grammarRight = 0, grammarTotal = 0;
        int readingRight = 0, readingTotal = 0;
        Map<Integer, Boolean> resultMap = new HashMap<>(); // questionId → 正解かどうか
        Map<Integer, Integer> optionMap = new HashMap<>(); // questionId → ユーザーが選んだ optionId

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

        // 3. 180 点満点へ換算：各セクション満点 60、当該セクションの正答率で換算
        int vocabScore = vocabTotal == 0 ? 0 : Math.round(vocabRight * 60f / vocabTotal);
        int grammarScore = grammarTotal == 0 ? 0 : Math.round(grammarRight * 60f / grammarTotal);
        int readingScore = readingTotal == 0 ? 0 : Math.round(readingRight * 60f / readingTotal);
        int totalScore = vocabScore + grammarScore + readingScore;
        int correctCount = vocabRight + grammarRight + readingRight;
        int totalCount = vocabTotal + grammarTotal + readingTotal;

        // 4. 成績表を保存（insert 後に record.id を自動書き戻し）
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

        // 5. 解答明細を保存
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
