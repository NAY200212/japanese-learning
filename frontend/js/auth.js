// 登录 / 注册页逻辑
const $ = (s) => document.querySelector(s);

// tab 切换
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const isLogin = btn.dataset.tab === 'login';
    $('#loginForm').classList.toggle('hidden', !isLogin);
    $('#registerForm').classList.toggle('hidden', isLogin);
    $('#msg').textContent = '';
  });
});

// 登录
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const msg = $('#msg');
  msg.textContent = '';

  try {
    const token = await api('/user/login', {
      method: 'POST',
      body: JSON.stringify({
        username: fd.get('username'),
        password: fd.get('password'),
      }),
    });
    setSession(token, fd.get('username'));
    location.href = 'app.html';
  } catch (err) {
    msg.textContent = err.message;
  }
});

// 注册
$('#registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const msg = $('#msg');
  msg.textContent = '';

  try {
    await api('/user/register', {
      method: 'POST',
      body: JSON.stringify({
        username: fd.get('username'),
        password: fd.get('password'),
        email: fd.get('email') || null,
      }),
    });
    msg.textContent = '注册成功，去登录吧。';
    msg.style.color = 'var(--ok)';
    document.querySelector('.tab[data-tab="login"]').click();
    e.target.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
});
