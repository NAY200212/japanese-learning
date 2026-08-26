// 测验页：题库答题（W3）
// 练习模式：按等级分页刷题；模拟考试：随机抽题判分
let quizQuestions = [];
let quizIndex = 0;
let quizCorrect = 0;
let quizLocked = false;
let quizLevel = 'N5';
let quizMode = 'practice'; // practice 练习 / exam 模拟考试

// Fisher-Yates 随机打乱（选项顺序随机，正确答案不再固定左侧）
function shuffleOptions(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 拉取当前等级总页数，更新页码输入框上限与提示
async function loadQuizPageTotal(el) {
  try {
    const page = await api(`/question/page?level=${quizLevel}&page=1&size=10`);
    const tp = (page && page.totalPages) || 1;
    const totalEl = el.querySelector('#quizPageTotal');
    const input = el.querySelector('#quizPageInput');
    if (totalEl) totalEl.textContent = `/ 共 ${tp} 页`;
    if (input) input.max = tp;
  } catch (e) { /* 静默降级 */ }
}

async function renderQuiz() {
  const el = document.getElementById('quiz');

  // 没有题目 → 显示模式选择
  if (quizQuestions.length === 0) {
    el.innerHTML = `
      <h2>测验</h2>
      <div class="quiz-box">
        <div class="quiz-prompt">选择模式</div>
        <div class="seg" style="margin-bottom:24px">
          <button class="tab ${quizMode === 'practice' ? 'active' : ''}" id="modePractice">练习</button>
          <button class="tab ${quizMode === 'exam' ? 'active' : ''}" id="modeExam">模拟考试</button>
        </div>
        <div class="quiz-prompt">等级</div>
        <div class="seg" style="margin-bottom:24px">
          ${['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => `<button class="tab ${quizLevel === l ? 'active' : ''}" data-level="${l}">${l}</button>`).join('')}
        </div>
        <div class="quiz-prompt" id="quizPagePrompt" style="${quizMode === 'practice' ? '' : 'display:none'}">页码</div>
        <div class="seg quiz-page-row" style="margin-bottom:24px;${quizMode === 'practice' ? '' : 'display:none'}">
          <input type="number" id="quizPageInput" min="1" value="1"
            style="width:90px;padding:8px 10px;background:rgba(18,25,34,.7);border:1px solid var(--line-hi);border-radius:2px;color:#fff;font-size:14px;">
          <span id="quizPageTotal" class="card-note" style="margin-left:10px">/ 共 ? 页</span>
        </div>
        <button class="quiz-next" id="startQuizBtn">开始答题</button>
      </div>
    `;

    el.querySelector('#modePractice').addEventListener('click', () => { quizMode = 'practice'; renderQuiz(); });
    el.querySelector('#modeExam').addEventListener('click', () => { quizMode = 'exam'; renderQuiz(); });
    el.querySelectorAll('.seg [data-level]').forEach((btn) => {
      btn.addEventListener('click', () => { quizLevel = btn.dataset.level; renderQuiz(); });
    });
    if (quizMode === 'practice') loadQuizPageTotal(el);
    el.querySelector('#startQuizBtn').addEventListener('click', async () => {
      try {
        // 先读取页码（下方会替换掉输入框 DOM）
        let pageNo = 1;
        if (quizMode === 'practice') {
          const input = el.querySelector('#quizPageInput');
          if (input) {
            pageNo = parseInt(input.value, 10);
            if (!pageNo || pageNo < 1) pageNo = 1;
          }
        }
        el.querySelector('.quiz-box').innerHTML = `<div class="quiz-prompt">出题中…</div>`;
        let list;
        if (quizMode === 'exam') {
          list = await api(`/question/random?level=${quizLevel}&count=10`);
        } else {
          const page = await api(`/question/page?level=${quizLevel}&page=${pageNo}&size=10`);
          list = page.list || [];
        }
        if (!list.length) {
          el.querySelector('.quiz-box').innerHTML = `<div class="quiz-prompt">该页暂无题目，试试其他页码</div>`;
          return;
        }
        // 逐题拉详情（带选项）
        quizQuestions = await Promise.all(list.map((q) => api(`/question/${q.id}`)));
        // 选项随机打乱：正确答案不再固定在左侧第一个
        quizQuestions.forEach((q) => { if (Array.isArray(q.options)) shuffleOptions(q.options); });
        quizIndex = 0;
        quizCorrect = 0;
        renderQuiz();
      } catch (e) {
        el.querySelector('.quiz-box').innerHTML = `<div class="quiz-prompt">加载失败：${e.message}</div>`;
      }
    });
    return;
  }

  // 结束页
  if (quizIndex >= quizQuestions.length) {
    const total = quizQuestions.length;
    el.innerHTML = `
      <h2>测验</h2>
      <div class="quiz-box">
        <div class="quiz-prompt">${quizMode === 'exam' ? '模拟考试' : '练习'}完成</div>
        <div class="quiz-end-num">${quizCorrect}<span> / ${total}</span></div>
        <div class="card-note">${quizCorrect === total ? '全对，很扎实。' : quizCorrect >= total * 0.7 ? '不错，错题重点看解析。' : '多练几遍，错题重点看解析。'}</div>
        <button class="quiz-next" id="retryBtn" style="margin-top:24px">再来一组</button>
      </div>
    `;
    el.querySelector('#retryBtn').addEventListener('click', () => { quizQuestions = []; renderQuiz(); });
    return;
  }

  const q = quizQuestions[quizIndex];
  quizLocked = false;

  el.innerHTML = `
    <h2>测验</h2>
    <div class="quiz-box">
      <div class="quiz-progress">第 ${quizIndex + 1} 题 / 共 ${quizQuestions.length} 题 · 答对 ${quizCorrect} 题 · ${q.level} ${q.type}</div>
      <div class="quiz-kana">${q.content}</div>
      <div class="quiz-prompt">选择正确答案</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `<button class="quiz-opt" data-idx="${i}">${String.fromCharCode(65 + i)}. ${opt.content}</button>`).join('')}
      </div>
      <div class="quiz-feedback" id="quizFb"></div>
      <button class="quiz-next hidden" id="nextBtn">下一题</button>
    </div>
  `;

  const fb = el.querySelector('#quizFb');

  el.querySelectorAll('.quiz-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (quizLocked) return;
      quizLocked = true;

      const idx = Number(btn.dataset.idx);
      const picked = q.options[idx];
      const correct = picked.isCorrect;

      el.querySelectorAll('.quiz-opt').forEach((b) => { b.disabled = true; });
      el.querySelectorAll('.quiz-opt').forEach((b) => {
        if (q.options[Number(b.dataset.idx)].isCorrect) b.classList.add('correct');
      });
      if (!correct) btn.classList.add('wrong');

      if (correct) {
        quizCorrect++;
        fb.textContent = '对。';
        fb.className = 'quiz-feedback ok';
      } else {
        fb.textContent = '不对，正确答案：' + q.options.filter((o) => o.isCorrect).map((o) => o.content).join('、');
        fb.className = 'quiz-feedback bad';
      }

      if (q.analysis) {
        fb.textContent += ` 解析：${q.analysis}`;
      }

      // W4：提交答题记录（答错自动进错题本，mode 区分练习/考试）
      api('/record/submit', {
        method: 'POST',
        body: JSON.stringify({ questionId: q.id, isCorrect: correct, mode: quizMode })
      }).catch(() => {});

      el.querySelector('#nextBtn').classList.remove('hidden');
    });
  });

  el.querySelector('#nextBtn').addEventListener('click', () => {
    quizIndex++;
    renderQuiz();
  });
}
