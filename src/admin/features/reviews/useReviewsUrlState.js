import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULTS = Object.freeze({
  status: 'pending',
  q: '',
  ratings: '',
  verified_only: '',
  date_from: '',
  date_to: '',
  page: 1,
  per_page: 25,
  sort_by: 'createdAt',
  sort_dir: 'desc',
});

const NUMERIC_KEYS = new Set(['page', 'per_page']);

function readParams(search) {
  const out = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    const raw = search.get(key);
    if (raw === null) continue;
    if (NUMERIC_KEYS.has(key)) {
      const n = Number(raw);
      out[key] = Number.isFinite(n) && n > 0 ? n : DEFAULTS[key];
    } else {
      out[key] = raw;
    }
  }
  return out;
}

function writeParams(state) {
  const next = new URLSearchParams();
  for (const key of Object.keys(DEFAULTS)) {
    const value = state[key];
    if (value === '' || value === null || value === undefined) continue;
    if (value === DEFAULTS[key]) continue;
    next.set(key, String(value));
  }
  return next;
}

export const SORT_PRESETS = [
  { value: 'createdAt:desc', label: 'Newest', sort_by: 'createdAt', sort_dir: 'desc' },
  { value: 'createdAt:asc', label: 'Oldest', sort_by: 'createdAt', sort_dir: 'asc' },
  { value: 'rating:desc', label: 'Highest rating', sort_by: 'rating', sort_dir: 'desc' },
  { value: 'rating:asc', label: 'Lowest rating', sort_by: 'rating', sort_dir: 'asc' },
];

export function presetValue(state) {
  return `${state.sort_by}:${state.sort_dir}`;
}

export const RATING_OPTIONS = [5, 4, 3, 2, 1];

export function parseRatings(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((v) => Number(v))
    .filter((n) => n >= 1 && n <= 5);
}

export default function useReviewsUrlState() {
  const [search, setSearch] = useSearchParams();

  const state = useMemo(() => readParams(search), [search]);

  const update = useCallback(
    (patch, { resetPage = false } = {}) => {
      setSearch(
        (prev) => {
          const current = readParams(prev);
          const next = { ...current, ...patch };
          if (resetPage) next.page = 1;
          return writeParams(next);
        },
        { replace: true },
      );
    },
    [setSearch],
  );

  const reset = useCallback(() => {
    setSearch(new URLSearchParams(), { replace: true });
  }, [setSearch]);

  return { state, update, reset, defaults: DEFAULTS };
}
