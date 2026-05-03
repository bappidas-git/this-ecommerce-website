const QUEUE_KEY = 'ti_queued_toast';

const ALLOWED_VARIANTS = new Set(['success', 'error', 'info', 'warning', 'brand']);

function safeRead() {
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(value) {
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(value));
  } catch {
    /* sessionStorage may be unavailable */
  }
}

function safeClear() {
  try {
    sessionStorage.removeItem(QUEUE_KEY);
  } catch {
    /* ignore */
  }
}

function normaliseVariant(variant) {
  return ALLOWED_VARIANTS.has(variant) ? variant : 'info';
}

export function queueToast({ variant = 'info', message } = {}) {
  if (typeof window === 'undefined') return;
  if (!message || typeof message !== 'string') return;
  const next = safeRead();
  next.push({ variant: normaliseVariant(variant), message });
  safeWrite(next);
}

export function drainToastQueue() {
  if (typeof window === 'undefined') return [];
  const items = safeRead();
  if (items.length === 0) return [];
  safeClear();
  return items
    .filter((t) => t && typeof t.message === 'string' && t.message.length > 0)
    .map((t) => ({ variant: normaliseVariant(t.variant), message: t.message }));
}

export const TOAST_QUEUE_KEY = QUEUE_KEY;
