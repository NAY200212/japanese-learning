// AI アシスタントページ：連続対話チャット UI（SSE ストリーミングのタイプライター出力＋多ターン記憶）
// API：POST /api/ai/chat/stream（text/event-stream）
//   リクエストヘッダーは Authorization: Bearer token（ログイン済み）と X-Chat-Session（ブラウザセッション）のどちらか一方または両方
//   レスポンスヘッダーの X-Chat-Session は localStorage に保存し、同一ブラウザでの連続対話に記憶を残す
//   イベント data 行：テキスト差分 → [DONE] 正常終了 → [ERROR]:xxx 異常
// エントリ維持：renderAi() は app.js のルーティングから呼び出し。旧 3 機能（誤答解説/単語例文/文法 Q&A）はショートカットボタンとして残し、
//   クリックで対応タスクのプロンプトを入力欄へ入れる

const AI_SESSION_KEY = 'kotoba_ai_session';

let aiSending = false;      // リクエスト中かどうか（重複送信の防止）
let aiBotEl = null;         // 現在出力中（タイプライター）の AI バブル
let aiTypeBuffer = '';      // タイプ待ちのテキストバッファ
let aiTypeTimer = null;     // タイプライター用タイマー
let aiStreamAbort = null;   // AbortController。ストリーム切断用

function renderAi() {
  const el = document.getElementById('ai');
  el.innerHTML = `
    <h2>AI 助手</h2>
    <p class="ai-head-note">DeepSeek 在线讲解 · 同一会话/同一账号自动记住前文，可连续追问 · 回答仅供参考，请以教材为准</p>

    <div class="chat-shell">
      <div class="chat-head">
        <span class="chat-title">ことば AI 对话</span>
        <span class="chat-sub" id="chatSessionHint">会话自动记忆</span>
        <button id="chatClearBtn" type="button" class="btn-ghost chat-clear">清空会话</button>
      </div>

      <div class="chat-messages" id="chatMessages"></div>

      <div class="chat-input-area">
        <div class="chat-quick">
          <span class="chat-quick-label">快捷提问</span>
          <button type="button" class="chat-quick-btn" data-q="wrong">错题解析</button>
          <button type="button" class="chat-quick-btn" data-q="word">单词例句</button>
          <button type="button" class="chat-quick-btn" data-q="grammar">语法问答</button>
        </div>
        <div class="chat-input-row">
          <textarea id="chatInput" class="chat-input" rows="2"
            placeholder="输入日语学习问题，回车发送（Shift+Enter 换行）"></textarea>
          <button id="chatSendBtn" type="button" class="btn-primary chat-send">发送</button>
        </div>
      </div>
    </div>
  `;

  // 歓迎メッセージ＋ショートカットテンプレートの説明
  appendChatMsg('ai',
    '你好，我是ことば AI 助教。可以问我：错题为什么错、某个单词怎么用、语法点之间的区别、复习计划建议……' +
    '\n\n当前会话/账号会自动保存最近约 10 轮对话记忆，你可以直接说「上一题呢」「再举个例子」连续追问。' +
    '\n下方三个快捷按钮可一键带入常用提问模板（填入输入框后可修改再发送）。'
  );

  // ショートカットボタン → テンプレートをセット
  const quickTpl = {
    wrong: '请帮我解析这道日语错题，说明考点并指出错因：\n（请把题干、选项和你选的答案补充在下面）\n',
    word: '请为日语单词「頑張る」生成 2-3 个地道例句，每条含假名注音与中文翻译，并说明常用搭配。（可以把「」里的词换成你想学的）',
    grammar: '请用中文讲解下面的日语语法点，并举 2-3 个例句帮助理解：\n（例如：～ように 和 ～ために 有什么区别？）'
  };
  el.querySelectorAll('.chat-quick-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ta = document.getElementById('chatInput');
      ta.value = quickTpl[btn.dataset.q] || '';
      ta.focus();
    });
  });

  // 送信
  document.getElementById('chatSendBtn').addEventListener('click', chatSend);
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      chatSend();
    }
  });

  // セッションをクリア（フロントのメッセージ＋バックエンドの Redis 記憶）
  document.getElementById('chatClearBtn').addEventListener('click', chatClear);
}

// ---------- メッセージエリア ----------

function appendChatMsg(role, text) {
  const box = document.getElementById('chatMessages');
  if (!box) return;
  const row = document.createElement('div');
  row.className = 'chat-msg ' + (role === 'user' ? 'user' : 'ai');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  if (text) bubble.textContent = text;
  row.appendChild(bubble);
  box.appendChild(row);
  scrollChat();
  return bubble;
}

function scrollChat() {
  const box = document.getElementById('chatMessages');
  if (box) box.scrollTop = box.scrollHeight;
}

// ---------- タイプライター ----------

function startTyping() {
  aiBotEl = appendChatMsg('ai', '');
  if (aiBotEl) aiBotEl.classList.add('typing');
  aiTypeBuffer = '';
  if (!aiTypeTimer) aiTypeTimer = setInterval(pumpType, 14);
}

function pumpType() {
  if (!aiBotEl) { stopTyping(); return; }
  if (aiTypeBuffer) {
    const take = Math.min(aiTypeBuffer.length, 2);
    aiBotEl.textContent += aiTypeBuffer.slice(0, take);
    aiTypeBuffer = aiTypeBuffer.slice(take);
    aiBotEl.classList.remove('typing');
    scrollChat();
  } else if (!aiStreamAbort || aiStreamAbort.signal.aborted) {
    // 新しい内容がなくストリームも終了していれば停止
    stopTyping();
  }
}

function feedBot(text) {
  if (!aiBotEl) startTyping();
  aiTypeBuffer += text;
  if (!aiTypeTimer) aiTypeTimer = setInterval(pumpType, 14);
}

function flushBot() {
  if (aiBotEl && aiTypeBuffer) {
    aiBotEl.textContent += aiTypeBuffer;
    aiTypeBuffer = '';
    aiBotEl.classList.remove('typing');
  }
  stopTyping();
  scrollChat();
}

function stopTyping() {
  if (aiTypeTimer) { clearInterval(aiTypeTimer); aiTypeTimer = null; }
}

// ---------- 送信 / SSE ストリーミング読み取り ----------

async function chatSend() {
  const ta = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const text = ta.value.trim();
  if (!text || aiSending) return;

  appendChatMsg('user', text);
  ta.value = '';
  ta.focus();

  aiSending = true;
  sendBtn.disabled = true;
  startTyping();

  const sessionId = localStorage.getItem(AI_SESSION_KEY) || '';
  const headers = { 'Content-Type': 'application/json' };
  if (sessionId) headers['X-Chat-Session'] = sessionId;
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  aiStreamAbort = new AbortController();
  try {
    const res = await fetch(API + '/ai/chat/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: text }),
      signal: aiStreamAbort.signal
    });

    if (res.status === 401) {
      clearSession();
      location.href = 'index.html';
      return;
    }
    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    // サーバーが割り当てたセッション id を保存（初回に X-Chat-Session が無ければ新しい id が返る）
    const sid = res.headers.get('X-Chat-Session');
    if (sid) localStorage.setItem(AI_SESSION_KEY, sid);

    if (!res.body) {
      throw new Error('当前浏览器不支持流式响应');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buf = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      // SSE の空行でイベントを区切り、data: 行の内容だけを取得
      let sep;
      while ((sep = buf.indexOf('\n\n')) >= 0) {
        const raw = buf.slice(0, sep);
        buf = buf.slice(sep + 2);
        const payload = raw
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).replace(/^ /, ''))
          .join('\n');
        if (payload) handleSseData(payload);
      }
    }
    // 末尾の残りを処理（一部チャンクが不完全な場合）
    if (buf.trim()) {
      const payload = buf.split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).replace(/^ /, ''))
        .join('\n');
      if (payload) handleSseData(payload);
    }
    // ストリーム終了時のフォールバック：バックエンドが [DONE] を送らなくてもバッファを出力し終えてタイマーを停止
    flushBot();
  } catch (e) {
    if (e.name === 'AbortError') {
      flushBot();
      aiSetError('（已停止）');
    } else {
      flushBot();
      aiSetError('请求失败：' + (e.message || '网络异常，请稍后重试'));
    }
  } finally {
    aiSending = false;
    const btn = document.getElementById('chatSendBtn');
    if (btn) btn.disabled = false;
    aiStreamAbort = null;
  }
}

function handleSseData(payload) {
  if (payload === '[DONE]') {
    flushBot();
    return;
  }
  if (payload.startsWith('[ERROR]')) {
    flushBot();
    aiSetError(payload.slice('[ERROR]'.length).replace(/^:/, '').trim() || 'AI 服务暂时不可用');
    return;
  }
  feedBot(payload);
}

function aiSetError(msg) {
  if (!aiBotEl) return;
  if (!aiBotEl.textContent) {
    aiBotEl.textContent = msg;
    aiBotEl.classList.add('err');
    aiBotEl.classList.remove('typing');
  } else {
    const tip = appendChatMsg('ai', '（' + msg + '）');
    if (tip) tip.classList.add('err');
  }
  scrollChat();
}

// ---------- セッションクリア ----------

async function chatClear() {
  const box = document.getElementById('chatMessages');
  if (box) {
    const n = box.querySelectorAll('.chat-msg').length;
    if (n > 1 && !confirm('确定清空当前会话记录吗？AI 将忘记之前聊过的内容。')) return;
  } else {
    return;
  }

  const sessionId = localStorage.getItem(AI_SESSION_KEY) || '';
  const headers = { 'Content-Type': 'application/json' };
  if (sessionId) headers['X-Chat-Session'] = sessionId;
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  try {
    await fetch(API + '/ai/chat/clear', { method: 'POST', headers, body: '{}' });
  } catch (e) {
    // バックエンドのクリア失敗時もローカルビューは通常どおりクリア
  }
  if (box) box.innerHTML = '';
  appendChatMsg('ai', '会话已清空。接下来是全新的一轮对话。');
}
