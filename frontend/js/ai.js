// AI 助手页：连续对话聊天界面（SSE 流式打字机输出 + 多轮记忆）
// 接口：POST /api/ai/chat/stream（text/event-stream）
//   请求头 Authorization: Bearer token（已登录）与 X-Chat-Session（浏览器会话）二选一或都带
//   响应头 X-Chat-Session 需要保存到 localStorage，保证同浏览器连续对话有记忆
//   事件 data 行：文本增量 → [DONE] 正常结束 → [ERROR]:xxx 异常
// 保留入口：renderAi() 由 app.js 路由调用；原三功能（错题解析/单词例句/语法问答）以快捷按钮保留，
//   点击后把对应任务提示词填入输入框。

const AI_SESSION_KEY = 'kotoba_ai_session';

let aiSending = false;      // 是否正在请求（防重复发送）
let aiBotEl = null;         // 当前正在输出（打字机）的 AI 气泡
let aiTypeBuffer = '';      // 待打字的文本缓冲
let aiTypeTimer = null;     // 打字机定时器
let aiStreamAbort = null;   // AbortController，用于断开流

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

  // 欢迎消息 + 快捷模板说明
  appendChatMsg('ai',
    '你好，我是ことば AI 助教。可以问我：错题为什么错、某个单词怎么用、语法点之间的区别、复习计划建议……' +
    '\n\n当前会话/账号会自动保存最近约 10 轮对话记忆，你可以直接说「上一题呢」「再举个例子」连续追问。' +
    '\n下方三个快捷按钮可一键带入常用提问模板（填入输入框后可修改再发送）。'
  );

  // 快捷按钮 → 填入模板
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

  // 发送
  document.getElementById('chatSendBtn').addEventListener('click', chatSend);
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      chatSend();
    }
  });

  // 清空会话（前端消息 + 后端 Redis 记忆）
  document.getElementById('chatClearBtn').addEventListener('click', chatClear);
}

// ---------- 消息区 ----------

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

// ---------- 打字机 ----------

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
    // 无新内容且流已结束则停止
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

// ---------- 发送 / SSE 流式读取 ----------

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

    // 保存服务端分配的会话 id（首次不带 X-Chat-Session 时返回新 id）
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

      // 按 SSE 空行分隔事件；只取 data: 行内容
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
    // 处理结尾残留（个别 chunk 不完整）
    if (buf.trim()) {
      const payload = buf.split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).replace(/^ /, ''))
        .join('\n');
      if (payload) handleSseData(payload);
    }
    // 流结束兜底：即使后端未发 [DONE] 也把缓冲输出完并停表
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

// ---------- 清空会话 ----------

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
    // 后端清理失败也照常清空本地视图
  }
  if (box) box.innerHTML = '';
  appendChatMsg('ai', '会话已清空。接下来是全新的一轮对话。');
}
