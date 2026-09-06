package com.japaneselearning.controller;

import com.japaneselearning.common.Result;
import com.japaneselearning.service.AiChatService;
import com.japaneselearning.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

/**
 * AI アシスタント API：/api/ai/*（userId 非依存）
 * ログイン状態は必須ではない（フロントがログイン済みなら token が付与されるだけで影響なし）
 */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI 助手", description = "DeepSeek AI：错题解析 / 单词例句 / 语法问答")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private AiChatService aiChatService;

    /**
     * 連続対話ストリーミング API：POST /api/ai/chat/stream（body は {message}）
     * SSE イベント：既定は message イベント。data はテキスト差分。終了時 data: [DONE]、異常時 data: [ERROR]:msg。
     * セッション：Authorization Bearer token が有効なら userId 単位で記憶。それ以外はリクエストヘッダー X-Chat-Session を使用。
     * 初回（X-Chat-Session なし & token なし）はレスポンスヘッダーで新規 X-Chat-Session を返し、フロントエンドが永続化する
     */
    @PostMapping(value = "/chat/stream", produces = "text/event-stream;charset=utf-8")
    @Operation(summary = "AI 连续对话（SSE 流式）",
            description = "body: {message: 用户消息}。响应为 text/event-stream；data 行增量文本，[DONE] 结束，[ERROR]:xxx 失败。携带 Authorization 或 X-Chat-Session 可获得多轮记忆")
    public SseEmitter chatStream(@RequestBody(required = false) Map<String, Object> body,
                                 @RequestHeader(value = "Authorization", required = false) String authorization,
                                 @RequestHeader(value = "X-Chat-Session", required = false) String clientSession,
                                 HttpServletResponse response) {
        String message = body == null ? null : String.valueOf(body.get("message"));
        AiChatService.SessionInfo info = aiChatService.resolveSession(authorization, clientSession);
        response.setContentType("text/event-stream;charset=utf-8");
        response.setHeader("X-Chat-Session", info.sessionId());
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("X-Accel-Buffering", "no");
        SseEmitter emitter = new SseEmitter(180_000L);
        aiChatService.chatStream(emitter, message, info.sessionId());
        return emitter;
    }

    /*現在のセッション履歴をクリア：POST /api/ai/chat/clear。チャットと同じ Authorization / X-Chat-Session を付与 */
    @PostMapping("/chat/clear")
    @Operation(summary = "清空 AI 对话记忆")
    public Result<Boolean> clearChat(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @RequestHeader(value = "X-Chat-Session", required = false) String clientSession) {
        AiChatService.SessionInfo info = aiChatService.resolveSession(authorization, clientSession);
        aiChatService.clearSession(info.sessionId());
        return Result.success(true);
    }

    @PostMapping("/wrong-analyze")
    @Operation(summary = "错题解析",
            description = "body: {questionId?: 题库题号; content?: 题干文本; options?: 选项数组; userAnswer?: 用户所选答案; correctAnswer?: 正确答案}。questionId 与 content 二选一（同时给优先 questionId 从题库取题）")
    public Result<String> wrongAnalyze(@RequestBody(required = false) Map<String, Object> body) {
        return Result.success(aiService.analyzeWrongQuestion(body == null ? Map.of() : body));
    }

    @PostMapping("/word-examples")
    @Operation(summary = "单词例句",
            description = "body: {word: 日语单词(必填或填 wordId); wordId?: 词库id，附带词义/级别上下文}")
    public Result<String> wordExamples(@RequestBody(required = false) Map<String, Object> body) {
        return Result.success(aiService.wordExamples(body == null ? Map.of() : body));
    }

    @PostMapping("/grammar")
    @Operation(summary = "语法问答", description = "body: {question: 日语语法/句型提问，必填}")
    public Result<String> grammar(@RequestBody(required = false) Map<String, Object> body) {
        return Result.success(aiService.askGrammar(body == null ? Map.of() : body));
    }
}
