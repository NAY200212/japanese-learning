// バックエンド API のアドレス（クラウドデプロイ時はパブリック URL に変更。ローカル開発は http://localhost:8081/api——AI 機能のデバッグ用）
const API = 'http://localhost:8081/api';

// token / ユーザー名は localStorage に保存し、以後すべてのリクエストに自動で Authorization ヘッダーを付与
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

// 共通リクエストラッパー：token を自動付与。401 ならセッションをクリアしてログインページへ。code !== 1 なら例外を投げる
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
