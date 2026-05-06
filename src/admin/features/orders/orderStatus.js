// Small order state machine + label/tone mappings, shared between list,
// quick-update popover, and (Prompt 48) detail page.

export const ORDER_STATUS = Object.freeze({
  pending: 'pending',
  confirmed: 'confirmed',
  preparing: 'preparing',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
});

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const ORDER_STATUS_LABELS = Object.freeze({
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
});

export const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...ORDER_STATUS_VALUES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
];

// Tone keys map directly to <StatusPill status="..." /> tones tuned for the
// dark admin surfaces.
export const ORDER_STATUS_PILL = Object.freeze({
  pending: 'pending',
  confirmed: 'confirmed',
  preparing: 'preparing',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
});

export const PAYMENT_STATUS_VALUES = ['paid', 'pending', 'refunded', 'failed'];

export const PAYMENT_STATUS_LABELS = Object.freeze({
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
  failed: 'Failed',
});

// Map payment status → existing <StatusPill> tone keys
// paid → success, pending → muted, refunded → warning, failed → error
export const PAYMENT_STATUS_PILL = Object.freeze({
  paid: 'completed',     // success tone
  pending: 'pending',    // muted tone
  refunded: 'ready',     // warning tone
  failed: 'cancelled',   // error tone
});

export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All payment status' },
  ...PAYMENT_STATUS_VALUES.map((s) => ({
    value: s,
    label: PAYMENT_STATUS_LABELS[s],
  })),
];

export const PAYMENT_METHOD_VALUES = ['card', 'cod', 'bank_transfer'];

export const PAYMENT_METHOD_LABELS = Object.freeze({
  card: 'Card',
  cod: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
});

export const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'All payment methods' },
  ...PAYMENT_METHOD_VALUES.map((m) => ({
    value: m,
    label: PAYMENT_METHOD_LABELS[m],
  })),
];

// Allowed status transitions. Mirrors the server state machine so the popover
// only offers valid next states.
export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
});

export function nextStatusesFor(current) {
  const key = String(current || '').toLowerCase();
  return ORDER_STATUS_TRANSITIONS[key] || [];
}

export function isTerminalStatus(status) {
  return nextStatusesFor(status).length === 0;
}
