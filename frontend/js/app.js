// 主框架：导航路由 + 仪表盘
const PAGES = ['dashboard', 'kana', 'quiz', 'exam', 'wrong', 'word', 'checkin'];

function showPage(name) {
  PAGES.forEach((p) => {
    document.getElementById(p).classList.toggle('hidden', p !== name);
  });
  document.querySelectorAll('.nav-link').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#/' + name);
  });

  if (name === 'dashboard') renderDashboard();
  if (name === 'kana') renderKana();
  if (name === 'quiz') renderQuiz();
  if (name === 'exam') renderExam();
  if (name === 'word') renderWord();
  if (name === 'checkin') renderCheckin();
  if (name === 'wrong') renderWrong();
}

// 路由：hash 变化时切页面
window.addEventListener('hashchange', () => {
  const name = location.hash.replace('#/', '') || 'dashboard';
  showPage(PAGES.includes(name) ? name : 'dashboard');
});

// 退出
document.getElementById('logoutBtn').addEventListener('click', () => {
  clearSession();
  location.href = 'index.html';
});

// 仪表盘：数据全部来自后端 /api/dashboard/stats
async function renderDashboard() {
  const el = document.getElementById('dashboard');
  el.innerHTML = `
    <h2>仪表盘</h2>
    <div class="dash-grid">
      <p class="card-note">加载中…</p>
    </div>
  `;

  let s;
  try {
    s = await api('/dashboard/stats');
  } catch (e) {
    el.querySelector('.dash-grid').innerHTML = `<p class="card-note">加载失败：${e.message}</p>`;
    return;
  }
  s = s || {};

  const checkinToday = !!s.checkinToday;
  const totalDays = s.checkinTotalDays || 0;
  const consec = s.checkinConsecutiveDays || 0;
  const wordTotal = s.wordTotal || 0;
  const wordMarked = s.wordMarked || 0;
  const familiar = s.wordFamiliar || 0;
  const vague = s.wordVague || 0;
  const strange = s.wordStrange || 0;
  const kanaMastered = s.kanaMastered || 0;
  const kanaTotal = s.kanaTotal || 0;
  const quizTotal = s.quizTotal || 0;
  const quizAnswered = s.quizAnswered || 0;
  const quizAccuracy = s.quizAccuracy || 0;
  const wrongPending = s.wrongPending || 0;
  const wrongTotalTimes = s.wrongTotalTimes || 0;

  const wordPct = wordTotal ? Math.round((wordMarked / wordTotal) * 100) : 0;
  const kanaPct = kanaTotal ? Math.round((kanaMastered / kanaTotal) * 100) : 0;
  const quizPct = quizTotal ? Math.round((quizAnswered / quizTotal) * 100) : 0;

  el.innerHTML = `
    <h2>仪表盘</h2>
    <div class="dash-grid">
      <div class="card dash-card">
        <div class="dash-label">今日打卡</div>
        <div class="dash-status ${checkinToday ? 'ok' : 'todo'}">${checkinToday ? '已打卡' : '未打卡'}</div>
        <div class="dash-sub">累计 ${totalDays} 天 · 连续 ${consec} 天</div>
        <a class="dash-link" href="#/checkin">${checkinToday ? '查看打卡' : '去打卡'}</a>
      </div>

      <div class="card dash-card">
        <div class="dash-label">单词标记</div>
        <div class="dash-num">${wordMarked}<span> / ${wordTotal}</span></div>
        <div class="bar"><div class="bar-fill" style="width:${wordPct}%"></div></div>
        <div class="dash-dist">
          <span class="dist familiar">熟悉 ${familiar}</span>
          <span class="dist vague">模糊 ${vague}</span>
          <span class="dist strange">陌生 ${strange}</span>
        </div>
        ${wordTotal === 0
          ? '<p class="card-note empty-tip">词库暂无数据</p>'
          : wordMarked === 0
            ? '<p class="card-note empty-tip">去背单词页标记吧</p>'
            : ''}
      </div>

      <div class="card dash-card">
        <div class="dash-label">五十音进度</div>
        <div class="dash-num">${kanaMastered}<span> / ${kanaTotal}</span></div>
        <div class="bar"><div class="bar-fill" style="width:${kanaPct}%"></div></div>
        <p class="card-note">${kanaPct === 100 ? '全部掌握，去测验检验一下。' : '每天记一行，比贪多更稳。'}</p>
      </div>

      <div class="card dash-card">
        <div class="dash-label">答题训练</div>
        <div class="dash-num">${quizAnswered}<span> / ${quizTotal}</span></div>
        <div class="bar"><div class="bar-fill" style="width:${quizPct}%"></div></div>
        <div class="dash-dist">
          <span class="dist familiar">正确率 ${quizAccuracy}%</span>
          <span class="dist vague">待复习 ${wrongPending}</span>
          <span class="dist strange">错题 ${wrongTotalTimes} 次</span>
        </div>
        <a class="dash-link" href="#/quiz">去做题</a>
      </div>
    </div>`;
}

// 进入应用：先验证 token（调 /user/me），失败自动跳回登录页
(async function init() {
  document.getElementById('userName').textContent = localStorage.getItem(USER_KEY) || '';
  if (!getToken()) { location.href = 'index.html'; return; }

  try {
    const me = await api('/user/me');
    document.getElementById('userName').textContent = me.username;
  } catch (e) {
    // api() 内部已处理跳转
    return;
  }

  const name = location.hash.replace('#/', '') || 'dashboard';
  showPage(PAGES.includes(name) ? name : 'dashboard');
})();
