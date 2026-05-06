const DEFAULT_TTL = 30_000;
const cache = new Map();

function stableStringify(value) {
  if (value == null) return '';
  if (typeof value !== 'object') return String(value);
  const keys = Object.keys(value).sort();
  const parts = keys.map((k) => `${k}=${stableStringify(value[k])}`);
  return parts.join('&');
}

export function makeKey(url, params) {
  return `${url}?${stableStringify(params)}`;
}

export function getCached(url, params) {
  const key = makeKey(url, params);
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(url, params, value, ttl = DEFAULT_TTL) {
  const key = makeKey(url, params);
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

export async function fetchCached(url, params, fetcher, ttl = DEFAULT_TTL) {
  const hit = getCached(url, params);
  if (hit !== null) return hit;
  const value = await fetcher();
  setCached(url, params, value, ttl);
  return value;
}

export function invalidate(prefix) {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export const adminQueryClient = {
  makeKey,
  getCached,
  setCached,
  fetchCached,
  invalidate,
};

export default adminQueryClient;
