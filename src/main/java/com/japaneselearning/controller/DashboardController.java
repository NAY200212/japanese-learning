package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.mapper.WordMemoryMapper;
import com.japaneselearning.service.CheckinService;
import com.japaneselearning.service.KanaProgressService;
import com.japaneselearning.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.japaneselearning.mapper.QuestionMapper;
import com.japaneselearning.mapper.AnswerRecordMapper;
import com.japaneselearning.mapper.WrongBookMapper;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "仪表盘统计", description = "学习进度总览")
public class DashboardController {

    @Autowired
    private CheckinService checkinService;
    @Autowired
    private WordMemoryMapper wordMemoryMapper;
    @Autowired
    private KanaProgressService kanaProgressService;
    @Autowired
    private WordService wordService;
    @Autowired
    private QuestionMapper questionMapper;
    @Autowired
    private AnswerRecordMapper answerRecordMapper;
    @Autowired
    private WrongBookMapper wrongBookMapper;

    // GET /api/dashboard/stats 学习总览统计
    @GetMapping("/stats")
    @Operation(summary = "学习统计总览")
    public Result<Map<String, Object>> stats(@RequestAttribute("userId") Integer userId) {
        Map<String, Object> data = new HashMap<>();

        // 打卡：今日是否打卡、总天数、连续天数
        data.put("checkinToday", checkinService.isCheckedToday(userId));
        Map<String, Object> checkinStats = checkinService.stats(userId);
        data.put("checkinTotalDays", checkinStats.get("totalDays"));
        data.put("checkinConsecutiveDays", checkinStats.get("consecutiveDays"));

        // 单词：词库总数、标记统计
        data.put("wordTotal", wordService.countByLevel(null));
        int familiar = 0, vague = 0, strange = 0;
        List<Map<String, Object>> counts = wordMemoryMapper.countByUser(userId);
        for (Map<String, Object> c : counts) {
            String status = (String) c.get("status");
            long n = ((Number) c.get("count")).longValue();
            if ("familiar".equals(status)) familiar += n;
            else if ("vague".equals(status)) vague += n;
            else if ("strange".equals(status)) strange += n;
        }
        data.put("wordFamiliar", familiar);
        data.put("wordVague", vague);
        data.put("wordStrange", strange);
        data.put("wordMarked", familiar + vague + strange);

        // 假名：已掌握数、总数（46 个清音）
        data.put("kanaMastered", kanaProgressService.countByUser(userId));
        data.put("kanaTotal", 46);

        // 答题：题库总数、答题数、正确率、错题
        data.put("quizTotal", questionMapper.countAll());
        int answered = answerRecordMapper.countByUser(userId);
        int correct = answerRecordMapper.countCorrectByUser(userId);
        data.put("quizAnswered", answered);
        data.put("quizCorrect", correct);
        data.put("quizAccuracy", answered == 0 ? 0 : Math.round(correct * 100.0 / answered));
        data.put("wrongPending", wrongBookMapper.countPendingByUser(userId));
        data.put("wrongTotalTimes", wrongBookMapper.sumWrongCountByUser(userId));

        return Result.success(data);

    }
}
