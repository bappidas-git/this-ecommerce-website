/**
 * Shop filter serializer.
 *
 * The shop page keeps filter state in the URL so that pages are deep-linkable
 * and the browser back/forward buttons work. This module owns the mapping
 * between the canonical camelCase filter object used in React land and the
 * snake_case keys we expose in the URL (and ultimately ship to the API).
 *
 * Adding a new filter? Add it to FILTER_DEFAULTS and URL_KEYS below — the rest
 * of the pipeline (parseFilters, serializeFilters, toServiceParams) is keyed
 * off those two maps. Prompt 53 (reports filters) extends this same dictionary.
 *
 * Accepted URL keys (snake_case):
 *   q          — free-text search within results
 *   category_id — numeric category id (locked from /shop/:slug when present)
 *   min_price  — inclusive lower bound on price
 *   max_price  — inclusive upper bound on price
 *   colors     — repeatable, e.g. ?colors=cream&colors=ink
 *   materials  — repeatable, e.g. ?materials=brass&materials=wood
 *   in_stock   — "true" to restrict to in-stock items
 *   on_sale    — "true" to restrict to discounted items
 *   sort       — one of SORT_OPTIONS values (featured, newest, price_asc, …)
 *   page       — 1-based page number
 *   per_page   — page size
 */

export const FILTER_DEFAULTS = Object.freeze({
  q: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  colors: [],
  materials: [],
  inStock: false,
  onSale: false,
  sort: 'featured',
  page: 1,
  perPage: 12,
});

// Canonical camelCase ⇄ snake_case URL key map.
export const URL_KEYS = Object.freeze({
  q: 'q',
  categoryId: 'category_id',
  minPrice: 'min_price',
  maxPrice: 'max_price',
  colors: 'colors',
  materials: 'materials',
  inStock: 'in_stock',
  onSale: 'on_sale',
  sort: 'sort',
  page: 'page',
  perPage: 'per_page',
});

const isEmpty = (v) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

const isDefault = (key, value) => {
  const def = FILTER_DEFAULTS[key];
  if (Array.isArray(def)) return Array.isArray(value) && value.length === 0;
  return def === value;
};

const numOrNull = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const toBool = (v) => v === true || v === 'true' || v === '1' || v === 1;

/**
 * Parse a URLSearchParams (or any object that exposes .get/.getAll) into the
 * canonical camelCase filter shape, applying defaults for missing values.
 */
export const parseFilters = (searchParams) => {
  const get = (k) => (searchParams?.get ? searchParams.get(k) : null);
  const all = (k) => (searchParams?.getAll ? searchParams.getAll(k) : []);

  const page = Math.max(1, Number(get('page')) || FILTER_DEFAULTS.page);
  const perPage = Math.max(1, Number(get('per_page')) || FILTER_DEFAULTS.perPage);

  return {
    q: get('q') || FILTER_DEFAULTS.q,
    categoryId: get('category_id') || FILTER_DEFAULTS.categoryId,
    minPrice: numOrNull(get('min_price')),
    maxPrice: numOrNull(get('max_price')),
    colors: all('colors').filter(Boolean),
    materials: all('materials').filter(Boolean),
    inStock: toBool(get('in_stock')),
    onSale: toBool(get('on_sale')),
    sort: get('sort') || FILTER_DEFAULTS.sort,
    page,
    perPage,
  };
};

/**
 * Serialize a camelCase filter state into a URLSearchParams instance using
 * snake_case keys. Default / empty values are pruned so URLs stay tidy.
 */
export const serializeFilters = (state = {}) => {
  const params = new URLSearchParams();
  for (const key of Object.keys(URL_KEYS)) {
    const value = state[key];
    if (isEmpty(value) || isDefault(key, value)) continue;
    const urlKey = URL_KEYS[key];
    if (Array.isArray(value)) {
      for (const v of value) {
        if (isEmpty(v)) continue;
        params.append(urlKey, String(v));
      }
    } else if (typeof value === 'boolean') {
      if (value) params.append(urlKey, 'true');
    } else {
      params.append(urlKey, String(value));
    }
  }
  return params;
};

/**
 * Build the plain camelCase object handed to useProducts → productService.
 * The downstream queryString helper converts camelCase → snake_case before
 * hitting the wire, so no extra transform is needed here.
 *
 * Defaults are dropped to keep request URLs and cache keys minimal.
 */
export const toServiceParams = (state = {}) => {
  const out = {};
  for (const key of Object.keys(URL_KEYS)) {
    const value = state[key];
    if (isEmpty(value) || isDefault(key, value)) continue;
    out[key] = Array.isArray(value) ? [...value] : value;
  }
  return out;
};

export default serializeFilters;
