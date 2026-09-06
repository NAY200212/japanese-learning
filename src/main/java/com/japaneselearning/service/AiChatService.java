package com.japaneselearning.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * AI 連続対話サービス（ストリーミング + 多輪記憶）。
 * セッション識別：優先的に Authorization から取得した userId を使用（同一ユーザーは端末をまたいで記憶を共有）。
 * 有効なログイン状態が無い場合はクライアント提供の X-Chat-Session を使用（フロントエンドは localStorage に保持し、同一ブラウザでの連続対話を保証）。
 */
public interface AiChatService {

    /*セッション解析結果 */
    record SessionInfo(String sessionId, boolean newSession) {
    }

    /**
     * セッション識別子の解析：Authorization Bearer token が有効 → "u{userId}"。
     * それ以外は X-Chat-Session にフォールバック。両方無い場合は新規 uuid を生成（呼び出し側は sessionId をレスポンスヘッダーでフロントエンドへ返す必要がある）。
     */
    SessionInfo resolveSession(String authorizationHeader, String clientSessionId);

    /**
     * ストリーミング対話を開始：履歴 + 現在の質問を DeepSeek に送信し、chunk を SSE でテキスト差分として配信。
     * 終了後に user/assistant メッセージを Redis へ追記（直近約 20 件に切り詰め、TTL 7 日）。
     * イベントプロトコル：data: <テキスト差分>（通常行）；data: [DONE]（正常終了）；data: [ERROR]:xxx（異常終了）。
     */
    void chatStream(SseEmitter emitter, String message, String sessionId);

    /*指定セッションの履歴記憶をクリア */
    void clearSession(String sessionId);
}
