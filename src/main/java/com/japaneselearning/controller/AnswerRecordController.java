package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.service.AnswerRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/record")
@Tag(name = "答题记录", description = "答题提交接口")
public class AnswerRecordController {

    @Autowired
    private AnswerRecordService answerRecordService;

    @PostMapping("/submit")
    @Operation(summary = "提交答题结果")
    public Result<String> submit(@RequestBody Map<String, Object> body,
                                 @RequestAttribute("userId") Integer userId) {
        Integer questionId = (Integer) body.get("questionId");
        Boolean isCorrect = (Boolean) body.get("isCorrect");
        String mode = (String) body.get("mode");
        answerRecordService.submit(userId, questionId, isCorrect, mode);
        return Result.success("ok");
    }
}
