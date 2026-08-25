package com.japaneselearning.controller;

import com.japaneselearning.common.PageResult;
import com.japaneselearning.common.Result;
import com.japaneselearning.entity.Question;
import com.japaneselearning.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question")
@Tag(name = "题库管理", description = "题目接口")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping("/page")
    @Operation(summary = "分页查询题目")
    public Result<PageResult<Question>> page(@RequestParam(required = false) String level,
                                             @RequestParam(required = false) String type,
                                             @RequestParam(defaultValue = "1") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        List<Question> list = questionService.findByCondition(level, type, page, size);
        int total = questionService.countByCondition(level, type);
        return Result.success(new PageResult<>(list, total, page, size));
    }

    @GetMapping("/random")
    @Operation(summary = "随机抽题")
    public Result<List<Question>> random(@RequestParam(required = false) String level,
                                         @RequestParam(defaultValue = "10") int count) {
        return Result.success(questionService.findRandom(level, count));
    }

    @GetMapping("/{id}")
    @Operation(summary = "题目详情（含选项）")
    public Result<Question> detail(@PathVariable("id") Integer id) {
        return Result.success(questionService.findDetail(id));
    }

}
