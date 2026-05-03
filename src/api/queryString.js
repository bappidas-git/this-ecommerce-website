const camelToSnake = (key) =>
  String(key).replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);

const isEmpty = (v) => v === null || v === undefined || v === '';

export const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (isEmpty(value)) continue;
    const snakeKey = camelToSnake(key);
    if (Array.isArray(value)) {
      for (const v of value) {
        if (isEmpty(v)) continue;
        params.append(snakeKey, String(v));
      }
    } else if (typeof value === 'boolean') {
      params.append(snakeKey, value ? 'true' : 'false');
    } else if (value instanceof Date) {
      params.append(snakeKey, value.toISOString());
    } else if (typeof value === 'object') {
      params.append(snakeKey, JSON.stringify(value));
    } else {
      params.append(snakeKey, String(value));
    }
  }
  return params.toString();
};

export const buildUrl = (path, params) => {
  const qs = toSnakeCase(params);
  return qs ? `${path}?${qs}` : path;
};

export const unwrap = (response) => response?.data?.data;

export const unwrapList = (response) => ({
  items: response?.data?.data ?? [],
  meta: response?.data?.meta ?? {},
});

export const unwrapEnvelope = (response) => response?.data;
