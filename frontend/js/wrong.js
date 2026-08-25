// 错题本页：W4
// 数据来自 /wrong/list，答错自动进本，可标记已掌握
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
    list = await api('/wrong/list');
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
  `;

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
