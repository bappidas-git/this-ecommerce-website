import axios from 'axios';

const STOREFRONT_TOKEN_KEY = 'ti_token';
const ADMIN_TOKEN_KEY = 'ti_admin_token';
const STOREFRONT_AUTH_EVENT = 'ti:auth-expired';
const ADMIN_AUTH_EVENT = 'ti:admin-auth-expired';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const isAdminUrl = (url) => {
  if (!url) return false;
  const stripped = String(url).replace(/^https?:\/\/[^/]+/i, '');
  return stripped.startsWith('/admin') || stripped.startsWith('admin');
};

export const tokenForUrl = (url) => {
  const key = isAdminUrl(url) ? ADMIN_TOKEN_KEY : STOREFRONT_TOKEN_KEY;
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const dispatchAuthExpired = (url) => {
  if (typeof window === 'undefined') return;
  const eventName = isAdminUrl(url) ? ADMIN_AUTH_EVENT : STOREFRONT_AUTH_EVENT;
  window.dispatchEvent(new CustomEvent(eventName));
};

const normalizeError = (err) => {
  const status = err?.response?.status ?? 0;
  const payload = err?.response?.data ?? {};
  const message =
    payload?.message ||
    err?.message ||
    (status >= 500 ? 'Server error' : 'Request failed');
  const errors = payload?.errors || null;
  const normalized = new Error(message);
  normalized.status = status;
  normalized.message = message;
  normalized.errors = errors;
  normalized.original = err;
  return normalized;
};

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

const buildOfflineError = () => {
  const offline = new Error('You appear to be offline.');
  offline.status = 0;
  offline.message = 'You appear to be offline.';
  offline.errors = null;
  offline.isOffline = true;
  return offline;
};

http.interceptors.request.use((config) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return Promise.reject(buildOfflineError());
  }
  const token = tokenForUrl(config.url);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (err) => {
    // Preserve cancellation errors so callers can detect aborts (e.g. React
    // StrictMode effect cleanups). Normalizing strips the name/code that
    // identifies them as cancels, which surfaces them as real errors.
    if (axios.isCancel(err)) throw err;
    if (err?.isOffline) throw err;
    const status = err?.response?.status;
    if (status === 401) {
      dispatchAuthExpired(err?.config?.url);
    }
    throw normalizeError(err);
  },
);

export const AUTH_EVENTS = Object.freeze({
  storefront: STOREFRONT_AUTH_EVENT,
  admin: ADMIN_AUTH_EVENT,
});

export default http;
