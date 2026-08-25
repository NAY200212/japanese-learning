// 背单词页：等级筛选 + 单词卡片 + 熟悉/模糊/陌生标记 + 分页
// 标记数据以后端 /api/word/memory/list 为准回显，localStorage 仅作离线缓存
const WORD_SIZE = 10;              // 每页单词数
const WORD_MARKED_KEY = 'kotoba_word_marked'; // 本地缓存 {wordId: status}
const WORD_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

let wordLevel = '';    // '' = 全部
let wordPage = 1;
let wordTotal = 0;
let wordList = [];
let wordMarked = {};   // wordId -> status（后端回显）

// 加载用户标记记录（后端为准，失败回退本地缓存）
async function loadWordMarks() {
  try {
    const list = await api('/word/memory/list');
    const map = {};
    (list || []).forEach((m) => { map[m.wordId] = m.status; });
    wordMarked = map;
    localStorage.setItem(WORD_MARKED_KEY, JSON.stringify(map));
  } catch (e) {
    try { wordMarked = JSON.parse(localStorage.getItem(WORD_MARKED_KEY) || '{}'); } catch (err) { wordMarked = {}; }
  }
}

function setWordMarked(id, status) {
  wordMarked[id] = status;
  localStorage.setItem(WORD_MARKED_KEY, JSON.stringify(wordMarked));
}

async function loadWords() {
  const query = new URLSearchParams();
  if (wordLevel) query.set('level', wordLevel);
  query.set('page', wordPage);
  query.set('size', WORD_SIZE);
  const data = await api('/word/list?' + query.toString());
  wordList = data.list || [];
  wordTotal = data.total || 0;
  wordPage = data.page || wordPage;
}

// 等级按钮显示名：空 = 全部
function levelLabel(lv) {
  return lv === '' ? '全部' : lv;
}

async function renderWord() {
  const el = document.getElementById('word');
  el.innerHTML = `
    <h2>背单词</h2>
    <div class="kana-toolbar">
      <div class="seg">
        ${['', ...WORD_LEVELS].map((lv) =>
          `<button data-level="${lv}" class="${wordLevel === lv ? 'active' : ''}">${levelLabel(lv)}</button>`
        ).join('')}
      </div>
      <span class="card-note">标记熟悉 / 模糊 / 陌生，记录保存到服务器</span>
    </div>
    <div class="word-list" id="wordList">
      <p class="card-note">加载中…</p>
    </div>
    <div class="word-pager" id="wordPager"></div>
  `;

  // 等级筛选
  el.querySelectorAll('.seg button').forEach((btn) => {
    btn.addEventListener('click', () => {
      wordLevel = btn.dataset.level;
      wordPage = 1;
      renderWord();
    });
  });

  try {
    await Promise.all([loadWordMarks(), loadWords()]);
    renderWordList(el);
  } catch (e) {
    el.querySelector('#wordList').innerHTML = `<p class="card-note">加载失败：${e.message}</p>`;
  }
}

function renderWordList(el) {
  const wrap = el.querySelector('#wordList');
  if (wordList.length === 0) {
    wrap.innerHTML = `<p class="card-note">${wordTotal === 0 ? '暂无单词，换个等级试试。' : '这一页没有单词。'}</p>`;
  } else {
    wrap.innerHTML = wordList.map((w) => wordCardHTML(w)).join('');
  }

  // 列表淡入（翻页 / 初次加载完成后触发）
  wrap.classList.remove('word-enter');
  void wrap.offsetWidth;
  wrap.classList.add('word-enter');

  // 标记按钮
  el.querySelectorAll('.mark-btns button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const status = btn.dataset.status;
      if (wordMarked[id]) return; // 已标记过

      try {
        await api('/word/memory', {
          method: 'POST',
          body: JSON.stringify({ wordId: id, status }),
        });
        setWordMarked(id, status);
        renderWordList(el);
      } catch (e) {
        // 标记失败：仅提示，不改变界面
        const card = wrap.querySelector(`[data-card="${id}"] .mark-state`);
        if (card) card.textContent = '标记失败：' + e.message;
      }
    });
  });

  renderWordPager(el);
}

function wordCardHTML(w) {
  const state = wordMarked[w.id];
  const pos = w.partOfSpeech ? `<span class="word-pos">${w.partOfSpeech}</span>` : '';
  const lv = w.level ? `<span class="word-level">${w.level}</span>` : '';

  let actions;
  if (state) {
    const stateText = { familiar: '已标记：熟悉', vague: '已标记：模糊', strange: '已标记：陌生' }[state] || '已标记';
    actions = `<div class="mark-state done">${stateText}</div>`;
  } else {
    actions = `
      <div class="mark-btns">
        <button class="mark-btn familiar" data-id="${w.id}" data-status="familiar">熟悉</button>
        <button class="mark-btn vague" data-id="${w.id}" data-status="vague">模糊</button>
        <button class="mark-btn strange" data-id="${w.id}" data-status="strange">陌生</button>
      </div>`;
  }

  return `
    <div class="word-card" data-card="${w.id}">
      <div class="word-main">
        <div class="word-jp">${w.word}</div>
        <div class="word-kana">${w.kana || ''}</div>
      </div>
      <div class="word-info">
        <div class="word-meaning">${w.meaning || ''}</div>
        <div class="word-tags">${pos}${lv}</div>
      </div>
      <div class="word-actions">
        ${actions}
        <div class="mark-state"></div>
      </div>
    </div>`;
}

function renderWordPager(el) {
  const pager = el.querySelector('#wordPager');
  if (wordTotal === 0) {
    pager.innerHTML = '';
    return;
  }
  const totalPages = Math.max(1, Math.ceil(wordTotal / WORD_SIZE));
  pager.innerHTML = `
    <button class="pager-btn" id="wordPrev" ${wordPage <= 1 ? 'disabled' : ''}>上一页</button>
    <span class="pager-info">第 ${wordPage} / ${totalPages} 页 · 共 ${wordTotal} 词</span>
    <button class="pager-btn" id="wordNext" ${wordPage >= totalPages ? 'disabled' : ''}>下一页</button>
  `;

  el.querySelector('#wordPrev').addEventListener('click', () => {
    if (wordPage <= 1) return;
    flipWordPage(-1, el);
  });

  el.querySelector('#wordNext').addEventListener('click', () => {
    if (wordPage >= totalPages) return;
    flipWordPage(1, el);
  });
}

// 翻页过渡：列表先淡出上移，数据加载完成后淡入上移（约 0.29s）
function flipWordPage(delta, el) {
  const wrap = el.querySelector('#wordList');
  if (!wrap) return;
  const pager = el.querySelector('#wordPager');
  if (pager) pager.querySelectorAll('.pager-btn').forEach((b) => { b.disabled = true; });
  wrap.classList.remove('word-enter');
  void wrap.offsetWidth;
  wrap.classList.add('word-leave');
  setTimeout(async () => {
    wordPage += delta;
    await renderWord();
  }, 290);
}
