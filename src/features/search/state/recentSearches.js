const STORAGE_KEY = 'ti_recent_searches';
const MAX_RECENT = 8;

const safeParse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

const readStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return safeParse(raw);
  } catch {
    return [];
  }
};

const writeStorage = (list) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage may be full or disabled — silently ignore */
  }
};

export const RECENT_SEARCHES_KEY = STORAGE_KEY;
export const RECENT_SEARCHES_MAX = MAX_RECENT;

export function getRecentSearches() {
  return readStorage();
}

export function addRecentSearch(query) {
  const cleaned = String(query || '').trim();
  if (!cleaned) return readStorage();
  const current = readStorage();
  const lower = cleaned.toLowerCase();
  const deduped = current.filter((q) => q.toLowerCase() !== lower);
  const next = [cleaned, ...deduped].slice(0, MAX_RECENT);
  writeStorage(next);
  return next;
}

export function clearRecentSearches() {
  writeStorage([]);
  return [];
}

export default {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
};
