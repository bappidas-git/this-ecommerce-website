import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULTS = Object.freeze({
  q: '',
  has_orders: '',
  newsletter: '',
  page: 1,
  per_page: 25,
  sort_by: 'joinedAt',
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
  { value: 'joinedAt:desc', label: 'Newest', sort_by: 'joinedAt', sort_dir: 'desc' },
  { value: 'lifetimeValue:desc', label: 'Top spenders', sort_by: 'lifetimeValue', sort_dir: 'desc' },
  { value: 'ordersCount:desc', label: 'Most orders', sort_by: 'ordersCount', sort_dir: 'desc' },
];

export function presetValue(state) {
  return `${state.sort_by}:${state.sort_dir}`;
}

export default function useCustomersUrlState() {
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
