package com.japaneselearning.controller;

import com.japaneselearning.common.PageResult;
import com.japaneselearning.common.Result;
import com.japaneselearning.dto.ExamSubmitRequest;
import com.japaneselearning.entity.ExamRecord;
import com.japaneselearning.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/exam")
@Tag(name = "模拟考试", description = "JLPT 模拟考试计分体系")
public class ExamController {

    private final ExamService examService;

    // 构造器注入
    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping("/submit")
    @Operation(summary = "提交试卷，返回180分制成绩单")
    public Result<ExamRecord> submit(@RequestBody ExamSubmitRequest request,
                                     @RequestAttribute("userId") Integer userId) {
        if (request.getLevel() == null || request.getAnswers() == null || request.getAnswers().isEmpty()) {
            return Result.error("level 和 answers 不能为空");
        }
        ExamRecord record = examService.submit(userId, request);
        return Result.success(record);
    }

    @GetMapping("/records")
    @Operation(summary = "分页查历史成绩")
    public Result<PageResult<ExamRecord>> records(@RequestAttribute("userId") Integer userId,
                                                  @RequestParam(required = false) String level,
                                                  @RequestParam(defaultValue = "1") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        return Result.success(examService.records(userId, level, page, size));
    }

    @GetMapping("/stats")
    @Operation(summary = "分项平均分统计")
    public Result<Map<String, Object>> stats(@RequestAttribute("userId") Integer userId,
                                             @RequestParam String level) {
        return Result.success(examService.stats(userId, level));
    }
}
