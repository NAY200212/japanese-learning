package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.entity.WrongBook;
import com.japaneselearning.service.WrongBookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wrong")
@Tag(name = "错题本", description = "错题查询与标记接口")
public class WrongBookController {

    @Autowired
    private WrongBookService wrongBookService;

    @GetMapping("/list")
    @Operation(summary = "错题列表（待复习）")
    public Result<List<WrongBook>> list(@RequestAttribute("userId") Integer userId) {
        return Result.success(wrongBookService.listByUser(userId));
    }

    @PostMapping("/master")
    @Operation(summary = "标记已掌握")
    public Result<String> master(@RequestBody Map<String, Object> body,
                                 @RequestAttribute("userId") Integer userId) {
        Integer questionId = (Integer) body.get("questionId");
        wrongBookService.markMastered(userId, questionId);
        return Result.success("ok");
    }
}
