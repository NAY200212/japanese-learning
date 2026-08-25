// 后端接口地址
const API = 'http://localhost:8080/api';

// token / 用户名存在 localStorage，之后所有请求自动带 Authorization 头
const TOKEN_KEY = 'kotoba_token';
const USER_KEY = 'kotoba_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// 统一请求封装：自动带 token；401 时清会话回登录页；code !== 1 时抛错
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API + path, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    location.href = 'index.html';
    throw new Error('登录已过期');
  }

  const body = await res.json().catch(() => ({}));
  if (body.code !== 1) throw new Error(body.message || '请求失败');
  return body.data;
}
