// 错题本页：W4
// 数据来自 /wrong/list（分页结构 { list, total, page, size, totalPages }），答错自动进本，可标记已掌握
let wrongPage = 1;
let wrongTotal = 0;
const WRONG_PAGE_SIZE = 10;

async function renderWrong() {
  const el = document.getElementById('wrong');

  el.innerHTML = `
    <h2>错题本</h2>
    <div class="card">
      <p class="card-note">加载中…</p>
    </div>
  `;

  let list;
  try {
    const page = await api('/wrong/list?page=' + wrongPage + '&size=' + WRONG_PAGE_SIZE);
    list = (page && page.list) || [];
    wrongTotal = (page && page.total) || 0;
  } catch (e) {
    el.innerHTML = `<h2>错题本</h2><div class="card"><p class="card-note">加载失败：${e.message}</p></div>`;
    return;
  }

  if (!list.length) {
    el.innerHTML = `
      <h2>错题本</h2>
      <div class="card">
        <p class="card-note">暂无错题，去测验页刷题吧。</p>
      </div>`;
    return;
  }

  const totalPages = Math.max(1, Math.ceil(wrongTotal / WRONG_PAGE_SIZE));

  el.innerHTML = `
    <h2>错题本</h2>
    <div class="wrong-list">
      ${list.map((w) => `
        <div class="card wrong-item">
          <div class="wrong-meta">
            <span class="word-level">${w.questionLevel || 'N?'}</span>
            <span class="info-badge">${w.questionType || ''}</span>
            <span class="wrong-count">错 ${w.wrongCount} 次 · 对 ${w.rightCount} 次</span>
          </div>
          <div class="wrong-content">${w.questionContent}</div>
          <div class="wrong-foot">
            <span class="wrong-time">最近出错：${(w.lastWrongAt || '').replace('T', ' ')}</span>
            <button class="btn-primary wrong-master" data-qid="${w.questionId}">标记已掌握</button>
          </div>
        </div>`).join('')}
    </div>
    ${totalPages > 1 ? `
      <div class="pager">
        <button type="button" class="btn-ghost" id="wrongPrevBtn" ${wrongPage <= 1 ? 'disabled' : ''}>上一页</button>
        <span class="pager-info">第 ${wrongPage} / ${totalPages} 页 · 共 ${wrongTotal} 题</span>
        <button type="button" class="btn-ghost" id="wrongNextBtn" ${wrongPage >= totalPages ? 'disabled' : ''}>下一页</button>
      </div>` : ''}
  `;

  const prevBtn = el.querySelector('#wrongPrevBtn');
  const nextBtn = el.querySelector('#wrongNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => { wrongPage--; renderWrong(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { wrongPage++; renderWrong(); });

  el.querySelectorAll('.wrong-master').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await api('/wrong/master', {
          method: 'POST',
          body: JSON.stringify({ questionId: Number(btn.dataset.qid) }),
        });
        renderWrong();
      } catch (e) {
        alert('操作失败：' + e.message);
      }
    });
  });
}
