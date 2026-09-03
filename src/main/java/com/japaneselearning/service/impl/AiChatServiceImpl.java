package com.japaneselearning.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.japaneselearning.service.AiChatService;
import com.japaneselearning.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * AI 连续对话实现：DeepSeek 流式输出（spring-ai ChatModel.stream），Redis 记录每轮 user/assistant 消息，
 * 下一轮把最近历史作为多轮消息一并提交，实现上下文记忆。Redis 异常自动降级为无记忆直连，不影响使用。
 */
@Slf4j
@Service
public class AiChatServiceImpl implements AiChatService {

    /** 历史键前缀：ai:chat:{sessionId} */
    private static final String HISTORY_PREFIX = "ai:chat:";

    /** 最多保留消息条数（约 10 轮） */
    private static final int MAX_HISTORY_MESSAGES = 20;

    /** 历史 TTL：7 天 */
    private static final Duration HISTORY_TTL = Duration.ofDays(7);

    private static final String FRIENDLY_ERR = "AI 服务暂时不可用，请稍后重试";
    private static final String EVENT_DONE = "[DONE]";
    private static final String EVENT_ERROR_PREFIX = "[ERROR]";

    private static final String SYSTEM_PROMPT = """
            你是「ことば（kotoba）」日语学习平台的 AI 助教，一名经验丰富、耐心细致的日语教师。
            平台功能包括：五十音学习、背单词、测验、模拟考试、错题本、每日打卡。
            你可以根据上下文帮助用户：讲解错题与考点、生成单词例句、辨析语法句型、给出复习建议等。

            回答要求：
            1. 默认使用简体中文讲解，日语原文/例句保留日文并在必要时标注假名读音。
            2. 内容分段清晰，每段尽量简短，可用「-」列表、空行分隔，方便聊天阅读。
            3. 回答前先理解上下文中之前的对话，若用户省略主语请结合前文补全，避免重复提问。
            4. 不确定的内容如实说明，不要编造语法规则或词义。
            """;

    @Autowired
    private ChatModel chatModel;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private static final TypeReference<List<Map<String, Object>>> HISTORY_TYPE = new TypeReference<>() {
    };

    @Override
    public SessionInfo resolveSession(String authorizationHeader, String clientSessionId) {
        // 1. 优先 Authorization Bearer token → userId
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7).trim();
            if (!token.isEmpty()) {
                try {
                    Long userId = jwtUtil.getUserIdFromToken(token);
                    if (userId != null) {
                        return new SessionInfo("u" + userId, false);
                    }
                } catch (Exception e) {
                    log.debug("AI 会话：token 无效，降级为客户端会话 key: {}", e.getMessage());
                }
            }
        }
        // 2. 客户端会话 key（同一浏览器持久化）
        if (StringUtils.hasText(clientSessionId)) {
            String clean = clientSessionId.trim();
            if (clean.length() > 64) {
                clean = clean.substring(0, 64);
            }
            return new SessionInfo(clean, false);
        }
        // 3. 新生成
        return new SessionInfo(UUID.randomUUID().toString().replace("-", "").substring(0, 24), true);
    }

    @Override
    public void chatStream(SseEmitter emitter, String message, String sessionId) {
        if (!StringUtils.hasText(message)) {
            sendError(emitter, "请输入要咨询的内容");
            return;
        }
        String userText = message.trim();

        // 读取历史（异常降级为空历史，不影响对话）
        List<Map<String, Object>> history = readHistory(sessionId);

        // 组装 messages：system 人设 + 历史多轮 + 本轮 user
        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(SYSTEM_PROMPT));
        for (Map<String, Object> item : history) {
            String role = item.get("role") == null ? "" : String.valueOf(item.get("role"));
            String content = item.get("content") == null ? "" : String.valueOf(item.get("content"));
            if ("user".equals(role)) {
                messages.add(new UserMessage(content));
            } else if ("assistant".equals(role)) {
                messages.add(new AssistantMessage(content));
            }
        }
        messages.add(new UserMessage(userText));

        AtomicBoolean finished = new AtomicBoolean(false);
        StringBuilder assistantText = new StringBuilder();

        Disposable disposable = chatModel.stream(new Prompt(messages))
                .doOnNext(resp -> {
                    if (finished.get()) {
                        return;
                    }
                    Generation gen = resp.getResult();
                    if (gen == null || gen.getOutput() == null) {
                        return;
                    }
                    String text = gen.getOutput().getText();
                    if (!StringUtils.hasText(text)) {
                        return;
                    }
                    assistantText.append(text);
                    try {
                        emitter.send(text);
                    } catch (IOException | IllegalStateException e) {
                        log.warn("AI 流式发送失败，客户端可能已断开: {}", e.getMessage());
                        throw new RuntimeException("SSE_SEND_ABORTED", e);
                    }
                })
                .doOnComplete(() -> {
                    if (!finished.compareAndSet(false, true)) {
                        return;
                    }
                    if (assistantText.length() == 0) {
                        sendLine(emitter, EVENT_ERROR_PREFIX + "AI 未返回有效内容，请重试");
                    } else {
                        // 追加本轮 user + assistant，截断 + TTL
                        history.add(roleItem("user", userText));
                        history.add(roleItem("assistant", assistantText.toString().trim()));
                        writeHistory(sessionId, history);
                        sendLine(emitter, EVENT_DONE);
                    }
                    try {
                        emitter.complete();
                    } catch (Exception ignored) {
                    }
                })
                .doOnError(err -> {
                    if (!finished.compareAndSet(false, true)) {
                        return;
                    }
                    log.error("AI 流式调用失败 session={}", sessionId, err);
                    sendError(emitter, FRIENDLY_ERR);
                    try {
                        emitter.complete();
                    } catch (Exception ignored) {
                    }
                })
                .subscribe();

        // 客户端断开/超时兜底：取消 DeepSeek 订阅，避免泄漏
        emitter.onTimeout(() -> {
            finished.set(true);
            disposable.dispose();
            emitter.complete();
        });
        emitter.onCompletion(() -> {
            finished.set(true);
            disposable.dispose();
        });
        emitter.onError(e -> {
            finished.set(true);
            disposable.dispose();
        });
    }

    @Override
    public void clearSession(String sessionId) {
        try {
            stringRedisTemplate.delete(HISTORY_PREFIX + sessionId);
        } catch (Exception e) {
            log.warn("AI 清空会话失败 session={}: {}", sessionId, e.getMessage());
        }
    }

    // ===== 内部方法 =====

    private List<Map<String, Object>> readHistory(String sessionId) {
        try {
            String raw = stringRedisTemplate.opsForValue().get(HISTORY_PREFIX + sessionId);
            if (!StringUtils.hasText(raw)) {
                return new ArrayList<>();
            }
            List<Map<String, Object>> list = objectMapper.readValue(raw, HISTORY_TYPE);
            return list == null ? new ArrayList<>() : new ArrayList<>(list);
        } catch (Exception e) {
            log.warn("AI 历史读取失败，按无历史处理 session={}: {}", sessionId, e.getMessage());
            return new ArrayList<>();
        }
    }

    private void writeHistory(String sessionId, List<Map<String, Object>> history) {
        try {
            int size = history.size();
            if (size > MAX_HISTORY_MESSAGES) {
                history = new ArrayList<>(history.subList(size - MAX_HISTORY_MESSAGES, size));
            }
            String json = objectMapper.writeValueAsString(history);
            stringRedisTemplate.opsForValue().set(HISTORY_PREFIX + sessionId, json, HISTORY_TTL);
        } catch (Exception e) {
            log.warn("AI 历史写入失败（不影响本次回复） session={}: {}", sessionId, e.getMessage());
        }
    }

    private static Map<String, Object> roleItem(String role, String content) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("role", role);
        m.put("content", content);
        return m;
    }

    private static void sendError(SseEmitter emitter, String msg) {
        sendLine(emitter, EVENT_ERROR_PREFIX + msg);
        try {
            emitter.complete();
        } catch (Exception ignored) {
        }
    }

    private static void sendLine(SseEmitter emitter, String line) {
        try {
            emitter.send(line);
        } catch (IOException | IllegalStateException e) {
            log.warn("AI SSE 发送失败: {}", e.getMessage());
        }
    }
}
