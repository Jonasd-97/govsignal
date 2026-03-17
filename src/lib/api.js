import { API_BASE } from '../constants';

const TOKEN_KEY = 'gs_token';

export const tokenStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export async function api(path, { method = 'GET', body, token, headers = {}, raw = false } = {}) {
  const authToken = token || tokenStore.get();
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(raw ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string'
      ? data
      : data?.error || data?.message || data?.detail || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}
