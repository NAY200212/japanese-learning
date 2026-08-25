package com.japaneselearning.controller;

import com.japaneselearning.common.PageResult;
import com.japaneselearning.common.Result;
import com.japaneselearning.entity.Word;
import com.japaneselearning.entity.WordMemory;
import com.japaneselearning.service.WordMemoryService;
import com.japaneselearning.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/word")
@Tag(name ="单词管理",description = "词库接口")
public class WordController {

    @Autowired
    private WordService wordService;
    @Autowired
    private WordMemoryService wordMemoryService;

    @GetMapping("/list")
    @Operation(summary = "分页查询单词")
    public Result<PageResult<Word>> list(@RequestParam(required = false) String level,
                                         @RequestParam(defaultValue = "1")int page,
                                         @RequestParam(defaultValue = "20")int size){
        List<Word> list = wordService.findByLevel(level,page,size);
        int total = wordService.countByLevel(level);
        return Result.success(new PageResult<>(list,total,page,size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "单词详情")
    public Result<Word> detail(@PathVariable("id") Integer id){
        return Result.success(wordService.findById(id));
    }

    @PostMapping("/memory")
    @Operation(summary = "标记单词记忆状态")
    public Result<String> mark(@RequestBody Map<String, String> body,
                               @RequestAttribute("userId") Integer userId) {
        Integer wordId = Integer.valueOf(body.get("wordId"));
        String status = body.get("status");
        wordMemoryService.mark(userId, wordId, status);
        return Result.success("标记成功");
    }

    @GetMapping("/memory/list")
    @Operation(summary = "查询用户全部记忆标记")
    public Result<List<WordMemory>> memoryList(@RequestAttribute("userId") Integer userId) {
        return Result.success(wordMemoryService.listByUser(userId));
    }

}
