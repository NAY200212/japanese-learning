package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.dto.ReviewItem;
import com.japaneselearning.service.WordReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@Tag(name = "间隔重复背词", description = "SRS 到期复习队列与复习提交")
public class WordReviewController {

    @Autowired
    private WordReviewService wordReviewService;

    // 到期复习队列：GET /api/review/due?limit=20
    @GetMapping("/due")
    @Operation(summary = "获取到期复习队列")
    public Result<List<ReviewItem>> getDue(@RequestAttribute("userId") Integer userId,
                                           @RequestParam(defaultValue = "20") int limit) {
        return Result.success(wordReviewService.getDueList(userId, limit));
    }

    // 提交复习结果：POST /api/review/submit  body: {"wordId": 5, "result": 1}
    @PostMapping("/submit")
    @Operation(summary = "提交复习结果(0忘记/1记得/2模糊)")
    public Result<String> submit(@RequestAttribute("userId") Integer userId,
                                 @RequestBody Map<String, Object> body) {
        Integer wordId = (Integer) body.get("wordId");
        Integer result = (Integer) body.get("result");
        if (wordId == null || result == null) {
            return Result.error("wordId 和 result 不能为空");
        }
        wordReviewService.submitReview(userId, wordId, result);
        return Result.success("提交成功");
    }

    // 复习统计：GET /api/review/stats
    @GetMapping("/stats")
    @Operation(summary = "复习统计(待复习/今日已复习)")
    public Result<Map<String, Object>> stats(@RequestAttribute("userId") Integer userId) {
        return Result.success(wordReviewService.getStats(userId));
    }
}
