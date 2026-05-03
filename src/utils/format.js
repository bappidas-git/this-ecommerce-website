import { format as dateFnsFormat } from 'date-fns';

const DEFAULT_CURRENCY = import.meta.env?.VITE_DEFAULT_CURRENCY || 'AED';

export function formatCurrency(value, currency = DEFAULT_CURRENCY) {
  const numeric = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatNumber(value) {
  const numeric = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(undefined).format(numeric);
}

export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '';
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return dateFnsFormat(parsed, pattern);
}

export function truncate(str, n) {
  if (typeof str !== 'string') return '';
  if (typeof n !== 'number' || n <= 0 || str.length <= n) return str;
  return `${str.slice(0, Math.max(0, n - 1)).trimEnd()}…`;
}
