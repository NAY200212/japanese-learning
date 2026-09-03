package com.japaneselearning.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * AI 连续对话服务（流式 + 多轮记忆）。
 * 会话标识：优先 Authorization 解析出的 userId（同一用户跨设备共享记忆）；
 * 无有效登录态时使用客户端提供的 X-Chat-Session（前端持久化在 localStorage，保证同一浏览器连续对话记忆）。
 */
public interface AiChatService {

    /** 会话解析结果 */
    record SessionInfo(String sessionId, boolean newSession) {
    }

    /**
     * 解析会话标识：Authorization Bearer token 有效 → "u{userId}"；
     * 否则回退 X-Chat-Session；两者都没有时生成新 uuid（调用方需把 sessionId 通过响应头返回给前端）。
     */
    SessionInfo resolveSession(String authorizationHeader, String clientSessionId);

    /**
     * 发起流式对话：把历史 + 当前问题发给 DeepSeek，chunk 经 SSE 推送文本增量，
     * 结束后追加 user/assistant 消息到 Redis（截断最近约 20 条、TTL 7 天）。
     * 事件协议：data: &lt;文本增量&gt;（普通行）；data: [DONE]（正常结束）；data: [ERROR]:xxx（异常结束）。
     */
    void chatStream(SseEmitter emitter, String message, String sessionId);

    /** 清空指定会话的历史记忆 */
    void clearSession(String sessionId);
}
