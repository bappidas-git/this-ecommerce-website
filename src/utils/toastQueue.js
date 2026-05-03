const QUEUE_KEY = 'ti_queued_toast';
const BANNER_QUEUE_KEY = 'ti_queued_banner';

const ALLOWED_VARIANTS = new Set(['success', 'error', 'info', 'warning', 'brand']);
const ALLOWED_BANNER_SEVERITIES = new Set(['success', 'error', 'info', 'warning']);

function safeReadKey(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteKey(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sessionStorage may be unavailable */
  }
}

function safeClearKey(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function normaliseVariant(variant) {
  return ALLOWED_VARIANTS.has(variant) ? variant : 'info';
}

function normaliseSeverity(severity) {
  return ALLOWED_BANNER_SEVERITIES.has(severity) ? severity : 'info';
}

export function queueToast({ variant = 'info', message } = {}) {
  if (typeof window === 'undefined') return;
  if (!message || typeof message !== 'string') return;
  const next = safeReadKey(QUEUE_KEY);
  next.push({ variant: normaliseVariant(variant), message });
  safeWriteKey(QUEUE_KEY, next);
}

export function drainToastQueue() {
  if (typeof window === 'undefined') return [];
  const items = safeReadKey(QUEUE_KEY);
  if (items.length === 0) return [];
  safeClearKey(QUEUE_KEY);
  return items
    .filter((t) => t && typeof t.message === 'string' && t.message.length > 0)
    .map((t) => ({ variant: normaliseVariant(t.variant), message: t.message }));
}

export function queueBanner({ severity = 'info', message, scope, durationMs = 8000 } = {}) {
  if (typeof window === 'undefined') return;
  if (!message || typeof message !== 'string') return;
  const next = safeReadKey(BANNER_QUEUE_KEY);
  next.push({
    severity: normaliseSeverity(severity),
    message,
    scope: typeof scope === 'string' ? scope : null,
    durationMs: Number.isFinite(durationMs) ? durationMs : 8000,
  });
  safeWriteKey(BANNER_QUEUE_KEY, next);
}

export function drainBannerQueue(scope) {
  if (typeof window === 'undefined') return [];
  const items = safeReadKey(BANNER_QUEUE_KEY);
  if (items.length === 0) return [];
  const matching = scope
    ? items.filter((b) => b && b.scope === scope)
    : items;
  const remaining = scope ? items.filter((b) => !(b && b.scope === scope)) : [];
  if (remaining.length === 0) {
    safeClearKey(BANNER_QUEUE_KEY);
  } else {
    safeWriteKey(BANNER_QUEUE_KEY, remaining);
  }
  return matching
    .filter((b) => b && typeof b.message === 'string' && b.message.length > 0)
    .map((b) => ({
      severity: normaliseSeverity(b.severity),
      message: b.message,
      scope: b.scope || null,
      durationMs: Number.isFinite(b.durationMs) ? b.durationMs : 8000,
    }));
}

export const TOAST_QUEUE_KEY = QUEUE_KEY;
export const BANNER_QUEUE_STORAGE_KEY = BANNER_QUEUE_KEY;
