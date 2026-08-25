// 打卡页：查询今日打卡状态，未打卡可打卡；数据全部走后端持久化
// 视觉：86 机械感（深黑+暖橙红+白金+军绿、瞄准镜、HUD 面板）+ 堀与宫村式滑动/入场动画
// 打卡成功后：印章盖下动画 + 标题切换过渡 + 按钮淡出；日历、记录条与统计来自后端
let checkinDone = false;     // 今日是否已打卡
let checkinMsg = '';         // 后端返回的文案
let scrollBound = false;     // 视差滚动监听只绑定一次

function pad2(n) { return String(n).padStart(2, '0'); }

function monthStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function dateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// 本月已打卡日期（后端返回字符串数组）
async function loadCheckinMonth() {
  try {
    const days = await api('/checkin/month?month=' + monthStr(new Date()));
    return Array.isArray(days) ? days : [];
  } catch (e) {
    return [];
  }
}

// 打卡统计 {totalDays, consecutiveDays}
async function loadCheckinStats() {
  try {
    const s = await api('/checkin/stats');
    return s || {};
  } catch (e) {
    return {};
  }
}

// 本月日历（7 列周历：列头 月火水木金土日，周一开头，(getDay()+6)%7 偏移）
function renderCheckinCal(el, days) {
  const cal = el.querySelector('#checkinCal');
  if (!cal) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const prefix = `${y}-${pad2(m + 1)}-`;
  const daySet = new Set((days || []).filter((d) => d.startsWith(prefix)));
  const today = dateStr(now);

  const startOffset = (new Date(y, m, 1).getDay() + 6) % 7; // 周一 = 0
  const totalDays = new Date(y, m + 1, 0).getDate();
  const heads = ['月', '火', '水', '木', '金', '土', '日'];

  // 列头直接作为 grid 子项（7 列），保证与日期数字逐列对齐
  let html = heads.map((w) => `<span class="cal-head">${w}</span>`).join('');
  for (let i = 0; i < startOffset; i++) html += '<span class="cal-empty"></span>';
  for (let d = 1; d <= totalDays; d++) {
    const ds = `${prefix}${pad2(d)}`;
    const cls = [
      'cal-day',
      daySet.has(ds) ? 'checked' : '',
      ds === today ? 'today' : '',
      ds > today ? 'future' : ''
    ].filter(Boolean).join(' ');
    html += `<span class="${cls}">${d}</span>`;
  }
  cal.innerHTML = html;
}

// 本月打卡记录：横向可滑动标签条（堀与宫村式滑动体验）
function renderCheckinRecords(el, days) {
  const wrap = el.querySelector('#checkinRecords');
  const bar = el.querySelector('#recordsBarFill');
  const countEl = el.querySelector('#recordsCount');
  if (!wrap) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const prefix = `${y}-${pad2(m + 1)}-`;
  const daySet = new Set((days || []).filter((d) => d.startsWith(prefix)));
  const totalDays = new Date(y, m + 1, 0).getDate();
  const done = daySet.size;

  if (countEl) countEl.textContent = `${done} / ${totalDays} 天`;
  if (bar) {
    bar.style.width = totalDays ? `${Math.min(100, Math.round((done / totalDays) * 100))}%` : '0%';
  }

  if (done === 0) {
    wrap.innerHTML = '<span class="records-empty">本月还没有打卡记录，坚持第 1 天吧。</span>';
    return;
  }

  const sorted = [...daySet].sort();
  wrap.innerHTML = sorted.map((ds) => {
    const dayNum = Number(ds.slice(-2));
    const isToday = ds === dateStr(now);
    return `<span class="record-pill${isToday ? ' today' : ''}"><span class="record-date">${m + 1}月${dayNum}日</span><span class="record-state">已打卡</span></span>`;
  }).join('');
}

// 显示印章；animated=true 时播放盖下动画
function showStamp(animated) {
  const stamp = document.getElementById('checkinStamp');
  if (!stamp) return;
  stamp.classList.remove('hidden');
  if (animated) {
    stamp.classList.remove('stamp-in');
    void stamp.offsetWidth; // 强制重排以重放动画
    stamp.classList.add('stamp-in');
  }
}

// 页面滚动视差：hero 上移更快、内容卡轻微上浮（仅绑定一次）
function bindParallax() {
  const content = document.querySelector('.content');
  if (!content || scrollBound) return;
  scrollBound = true;
  content.addEventListener('scroll', () => {
    const hero = document.querySelector('#checkin .checkin-hero');
    const split = document.querySelector('#checkin .checkin-split');
    const y = content.scrollTop || 0;
    if (hero) hero.style.setProperty('--parallax', `${Math.min(y * 0.12, 42)}px`);
    if (split) split.style.setProperty('--parallax', `${Math.min(y * 0.05, 20)}px`);
  });
}

async function renderCheckin() {
  const el = document.getElementById('checkin');
  const now = new Date();
  const monthTitle = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  const weekEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];
  const heroDate = `${now.getFullYear()}.${pad2(now.getMonth() + 1)}.${pad2(now.getDate())} / ${weekEn}`;

  el.innerHTML = `
    <h2>打卡</h2>

    <!-- 86 式：机械感主视觉（深黑+暖橙红+白金+军绿，瞄准镜/竖排 logo/导航分隔线） -->
    <div class="checkin-hero">
      <span class="hero-nav-line"></span>
      <span class="hero-meta">// CHECK-IN SYSTEM <i>v2.6</i></span>
      <span class="hero-logo-vert">ことば</span>
      <span class="hero-cross"></span>
      <span class="hero-corner hero-corner-tl"></span>
      <span class="hero-corner hero-corner-tr"></span>
      <span class="hero-corner hero-corner-bl"></span>
      <span class="hero-corner hero-corner-br"></span>
      <div class="hero-title">
        <span class="hero-en">DAILY CHECK-IN</span>
        <span class="hero-ja">今日のことば</span>
        <span class="hero-date">${heroDate}</span>
      </div>
      <div class="hero-scroll"><span class="hero-scroll-arrow">↓</span><span>SCROLL</span></div>
    </div>

    <!-- 堀与宫村式：左右分屏（窄屏自动单列堆叠） -->
    <div class="checkin-split">
      <aside class="checkin-info">
        <span class="hud-corner hud-corner-tl"></span>
        <span class="hud-corner hud-corner-tr"></span>
        <span class="hud-corner hud-corner-bl"></span>
        <span class="hud-corner hud-corner-br"></span>
        <span class="info-vertical">ことば</span>
        <div class="info-badge" id="infoBadge"><span class="badge-txt">本日</span></div>
        <div class="checkin-stamp hidden" id="checkinStamp"><span>已</span><span>打</span><span>卡</span></div>
        <div class="info-title" id="checkinTitle">加载中…</div>
        <div class="info-note" id="checkinNote"></div>
        <button class="btn-primary checkin-btn hidden" id="checkinBtn">今日打卡</button>
        <div class="info-stats">
          <div class="info-stat">
            <span class="info-stat-num" id="statTotal">-</span>
            <span class="info-stat-label">累计天数</span>
          </div>
          <div class="info-stat-divider"></div>
          <div class="info-stat">
            <span class="info-stat-num" id="statConsec">-</span>
            <span class="info-stat-label">连续天数</span>
          </div>
        </div>
      </aside>

      <main class="checkin-main">
        <div class="checkin-cal-card">
          <span class="hud-corner hud-corner-tl"></span>
          <span class="hud-corner hud-corner-tr"></span>
          <span class="hud-corner hud-corner-bl"></span>
          <span class="hud-corner hud-corner-br"></span>
          <div class="checkin-cal-title">${monthTitle}<span class="cal-title-sub">/ ${now.getFullYear()}</span></div>
          <div class="checkin-cal" id="checkinCal"></div>
          <div class="checkin-cal-note">// 记录已同步至服务器</div>
        </div>

        <!-- 堀与宫村式：横向滑动记录条 -->
        <div class="checkin-records">
          <span class="hud-corner hud-corner-tl"></span>
          <span class="hud-corner hud-corner-tr"></span>
          <span class="hud-corner hud-corner-bl"></span>
          <span class="hud-corner hud-corner-br"></span>
          <div class="records-head">
            <span class="records-title">本月打卡记录</span>
            <span class="records-side">
              <span class="records-count" id="recordsCount">-</span>
              <span class="records-swipe">SWIPE →</span>
            </span>
          </div>
          <div class="records-bar"><div class="records-bar-fill" id="recordsBarFill"></div></div>
          <div class="records-scroll"><div class="records-track" id="checkinRecords"></div></div>
        </div>
      </main>
    </div>
  `;

  // 并行拉取：本月日历 + 统计
  const [monthDays, stats] = await Promise.all([loadCheckinMonth(), loadCheckinStats()]);
  renderCheckinCal(el, monthDays);
  renderCheckinRecords(el, monthDays);
  const statTotal = el.querySelector('#statTotal');
  const statConsec = el.querySelector('#statConsec');
  if (statTotal) statTotal.textContent = stats.totalDays != null ? stats.totalDays : '-';
  if (statConsec) statConsec.textContent = stats.consecutiveDays != null ? stats.consecutiveDays : '-';

  try {
    checkinDone = !!(await api('/checkin/today'));
  } catch (e) {
    el.querySelector('#checkinTitle').textContent = '加载失败';
    el.querySelector('#checkinNote').textContent = e.message;
    return;
  }

  const title = el.querySelector('#checkinTitle');
  const note = el.querySelector('#checkinNote');
  const btn = el.querySelector('#checkinBtn');
  const badge = el.querySelector('#infoBadge');

  if (checkinDone) {
    title.textContent = '今日已打卡';
    note.textContent = checkinMsg || '保持节奏，明天也来。';
    badge.classList.add('done');
    badge.querySelector('.badge-txt').textContent = '済';
    showStamp(false);
    bindParallax();
    return;
  }

  title.textContent = '今日尚未打卡';
  note.textContent = '每天打一次卡，坚持就是进步。';
  btn.classList.remove('hidden');

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add('pressed');
    btn.textContent = '打卡中…';
    try {
      const data = await api('/checkin', { method: 'POST' });
      checkinDone = true;
      checkinMsg = typeof data === 'string'
        ? data
        : (data && (data.message || data.text)) || '打卡成功，保持节奏。';

      // 印章盖下 + 状态切换过渡 + 按钮淡出
      showStamp(true);
      badge.classList.add('done');
      badge.querySelector('.badge-txt').textContent = '済';
      title.textContent = '今日已打卡';
      note.textContent = checkinMsg;
      title.classList.add('switch-in');
      btn.classList.remove('pressed');
      btn.classList.add('fade-out');
      setTimeout(() => btn.classList.add('hidden'), 260);

      // 刷新日历、记录条与统计
      const [md, st] = await Promise.all([loadCheckinMonth(), loadCheckinStats()]);
      renderCheckinCal(el, md);
      renderCheckinRecords(el, md);
      if (statTotal) statTotal.textContent = st.totalDays != null ? st.totalDays : '-';
      if (statConsec) statConsec.textContent = st.consecutiveDays != null ? st.consecutiveDays : '-';
    } catch (e) {
      btn.disabled = false;
      btn.classList.remove('pressed');
      btn.textContent = '今日打卡';
      note.textContent = '打卡失败：' + e.message;
    }
  });

  bindParallax();
}
