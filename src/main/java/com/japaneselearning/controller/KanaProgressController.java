package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.service.KanaProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kana/progress")
@Tag(name = "假名掌握进度", description = "已掌握假名的持久化")
public class KanaProgressController {

    @Autowired
    private KanaProgressService kanaProgressService;

    // GET /api/kana/progress 查已掌握列表
    @GetMapping
    @Operation(summary = "查询已掌握假名列表")
    public Result<List<String>> list(@RequestAttribute("userId") Integer userId) {
        return Result.success(kanaProgressService.listByUser(userId));
    }

    // POST /api/kana/progress 设置掌握状态
    // body: {"hiragana": "あ", "mastered": true}  true=添加 false=取消
    @PostMapping
    @Operation(summary = "设置假名掌握状态")
    public Result<String> set(@RequestBody Map<String, Object> body,
                              @RequestAttribute("userId") Integer userId) {
        String hiragana = (String) body.get("hiragana");
        boolean mastered = Boolean.TRUE.equals(body.get("mastered"));
        kanaProgressService.setMastered(userId, hiragana, mastered);
        return Result.success(mastered ? "已标记掌握" : "已取消掌握");
    }
}
