import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULTS = Object.freeze({
  q: '',
  status: '', // CSV (e.g. "pending,confirmed")
  payment_method: '',
  payment_status: '',
  from: '',
  to: '',
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

export default function useOrdersUrlState() {
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
