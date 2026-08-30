// 模拟考试页（P2）：JLPT 180 分制计分 + 历史成绩趋势
let examLevel = 'N5';
let examQuestions = [];
let examIndex = 0;
let examAnswers = [];
let examLocked = false;
let examResult = null;

// 本地选项打乱（与 quiz.js 互不干扰）
function examShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function renderExam() {
  const el = document.getElementById('exam');

  // 成绩单页
  if (examResult) {
    const r = examResult;
    const acc = r.totalCount ? Math.round((r.correctCount / r.totalCount) * 100) : 0;
    el.innerHTML = `
      <h2>模拟考试 · ${examLevel}</h2>
      <div class="quiz-box">
        <div class="quiz-prompt">成绩单</div>
        <div class="quiz-end-num">${r.totalScore}<span> / 180</span></div>
        <div class="card-note">答对 ${r.correctCount} / ${r.totalCount} 题 · 正确率 ${acc}%</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px">
          <div class="card" style="padding:14px"><div class="dash-label">文字語彙</div><div class="dash-num">${r.vocabScore}<span>/60</span></div></div>
          <div class="card" style="padding:14px"><div class="dash-label">文法</div><div class="dash-num">${r.grammarScore}<span>/60</span></div></div>
          <div class="card" style="padding:14px"><div class="dash-label">読解</div><div class="dash-num">${r.readingScore}<span>/60</span></div></div>
        </div>
        <div style="margin-top:24px">
          <button class="quiz-next" id="againExamBtn">再来一次</button>
          <button class="btn-ghost" id="showHistoryBtn2" style="margin-left:12px">查看历史成绩</button>
        </div>
        <div id="examHistory" style="margin-top:8px"></div>
      </div>
    `;
    el.querySelector('#againExamBtn').addEventListener('click', () => {
      examResult = null; examQuestions = []; renderExam();
    });
    el.querySelector('#showHistoryBtn2').addEventListener('click', () =>
      renderHistory(el.querySelector('#examHistory')));
    return;
  }

  // 开始页
  if (examQuestions.length === 0) {
    el.innerHTML = `
      <h2>模拟考试</h2>
      <div class="quiz-box">
        <div class="quiz-prompt">选择等级</div>
        <div class="seg" style="margin-bottom:24px">
          ${['N5', 'N4', 'N3'].map((l) => `<button class="tab ${examLevel === l ? 'active' : ''}" data-level="${l}">${l}</button>`).join('')}
        </div>
        <div class="quiz-prompt">JLPT 180 分制 · 随机抽 20 题</div>
        <div class="card-note" style="margin:10px 0 24px">文字語彙 / 文法 / 読解 各占 60 分，按正确率折算</div>
        <button class="quiz-next" id="startExamBtn">开始考试</button>
        <div style="margin-top:24px">
          <button class="btn-ghost" id="showHistoryBtn">查看历史成绩</button>
        </div>
        <div id="examHistory" style="margin-top:8px"></div>
      </div>
    `;
    el.querySelectorAll('.seg [data-level]').forEach((btn) => {
      btn.addEventListener('click', () => { examLevel = btn.dataset.level; renderExam(); });
    });
    el.querySelector('#startExamBtn').addEventListener('click', startExam);
    el.querySelector('#showHistoryBtn').addEventListener('click', () =>
      renderHistory(el.querySelector('#examHistory')));
    return;
  }

  // 提交页
  if (examIndex >= examQuestions.length) {
    el.innerHTML = `
      <h2>模拟考试 · ${examLevel}</h2>
      <div class="quiz-box">
        <div class="quiz-prompt">已答完 ${examAnswers.length} 题，确认提交？</div>
        <div class="card-note" style="margin:10px 0 24px">提交后按 180 分制生成成绩单并保存</div>
        <button class="quiz-next" id="submitExamBtn">提交试卷</button>
        <div style="margin-top:12px">
          <button class="btn-ghost" id="backExamBtn">返回重考</button>
        </div>
      </div>
    `;
    el.querySelector('#submitExamBtn').addEventListener('click', submitExam);
    el.querySelector('#backExamBtn').addEventListener('click', () => {
      examQuestions = []; examResult = null; renderExam();
    });
    return;
  }

  // 做题页
  const q = examQuestions[examIndex];
  examLocked = false;
  el.innerHTML = `
    <h2>模拟考试 · ${examLevel}</h2>
    <div class="quiz-box">
      <div class="quiz-progress">第 ${examIndex + 1} 题 / 共 ${examQuestions.length} 题 · ${q.type}</div>
      <div class="quiz-kana">${q.content}</div>
      <div class="quiz-prompt">选择答案</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `<button class="quiz-opt" data-idx="${i}">${String.fromCharCode(65 + i)}. ${opt.content}</button>`).join('')}
      </div>
    </div>
  `;

  el.querySelectorAll('.quiz-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (examLocked) return;
      examLocked = true;
      const idx = Number(btn.dataset.idx);
      examAnswers.push({ questionId: q.id, optionId: q.options[idx].id });
      btn.classList.add('correct');
      setTimeout(() => { examIndex++; renderExam(); }, 180);
    });
  });
}

async function startExam() {
  const el = document.getElementById('exam');
  try {
    const list = await api(`/question/random?level=${examLevel}&count=20`);
    if (!list || !list.length) {
      alert('该等级暂无题目');
      return;
    }
    // 逐题拉详情（带选项）
    examQuestions = await Promise.all(list.map((q) => api(`/question/${q.id}`)));
    // 选项打乱 + 剥掉正确答案字段（考试过程不展示对错）
    examQuestions.forEach((q) => {
      if (Array.isArray(q.options)) {
        examShuffle(q.options);
        q.options.forEach((o) => { o.isCorrect = undefined; });
      }
    });
    examIndex = 0;
    examAnswers = [];
    examResult = null;
    renderExam();
  } catch (e) {
    alert('加载题目失败：' + e.message);
  }
}

async function submitExam() {
  const btn = document.getElementById('submitExamBtn');
  btn.disabled = true;
  btn.textContent = '提交中…';
  try {
    const r = await api('/exam/submit', {
      method: 'POST',
      body: JSON.stringify({ level: examLevel, answers: examAnswers })
    });
    examResult = r;
    renderExam();
  } catch (e) {
    btn.disabled = false;
    btn.textContent = '提交失败，重试';
    alert('提交失败：' + e.message);
  }
}

// 历史成绩：列表 + 内联 SVG 折线趋势 + 分项平均
async function renderHistory(container) {
  if (!container) return;
  container.innerHTML = '<p class="card-note">加载中…</p>';
  try {
    const page = await api(`/exam/records?level=${examLevel}&page=1&size=50`);
    const records = (page && page.list) || [];
    if (!records.length) {
      container.innerHTML = '<p class="card-note">还没有考试记录，先考一场吧</p>';
      return;
    }

    const W = 520, H = 180, pad = 26;
    const max = 180, min = 0;
    const n = records.length;
    const stepX = n > 1 ? (W - pad * 2) / (n - 1) : 0;
    const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    const pts = records.map((r, i) => `${pad + i * stepX},${y(r.totalScore)}`).join(' ');

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:520px;background:rgba(18,25,34,.5);border:1px solid var(--line-hi);border-radius:4px;margin-top:14px">`;
    svg += `<line x1="${pad}" y1="${y(180)}" x2="${W - pad}" y2="${y(180)}" stroke="rgba(255,255,255,.2)"/>`;
    svg += `<line x1="${pad}" y1="${y(90)}" x2="${W - pad}" y2="${y(90)}" stroke="rgba(255,255,255,.08)" stroke-dasharray="4"/>`;
    svg += `<line x1="${pad}" y1="${y(0)}" x2="${W - pad}" y2="${y(0)}" stroke="rgba(255,255,255,.2)"/>`;
    svg += `<text x="${W - pad}" y="${y(180) + 14}" fill="rgba(255,255,255,.5)" font-size="10">180</text>`;
    svg += `<text x="${W - pad}" y="${y(0) + 14}" fill="rgba(255,255,255,.5)" font-size="10">0</text>`;
    svg += `<polyline points="${pts}" fill="none" stroke="#ff6a3d" stroke-width="2"/>`;
    records.forEach((r, i) => {
      svg += `<circle cx="${pad + i * stepX}" cy="${y(r.totalScore)}" r="3" fill="#ff6a3d"/>`;
    });
    svg += '</svg>';

    const st = await api(`/exam/stats?level=${examLevel}`).catch(() => null);
    container.innerHTML = `
      <p class="card-note" style="margin-top:14px">共 ${records.length} 次考试 · 总分趋势</p>
      ${svg}
      <p class="card-note" style="margin-top:8px">
        平均分：总分 ${st ? Math.round(st.avgTotal) : '-'} ·
        文字語彙 ${st ? Math.round(st.avgVocab) : '-'} ·
        文法 ${st ? Math.round(st.avgGrammar) : '-'} ·
        読解 ${st ? Math.round(st.avgReading) : '-'}
      </p>
    `;
  } catch (e) {
    container.innerHTML = `<p class="card-note">加载失败：${e.message}</p>`;
  }
}
