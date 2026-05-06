// Order status state machine — single source of truth for valid transitions
// in the admin app. Mirrors the server-side machine in server/server.js.

export const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
});

export const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

export function nextStatuses(current) {
  const key = String(current || '').toLowerCase();
  return ORDER_STATUS_TRANSITIONS[key] || [];
}

export function canTransition(from, to) {
  return nextStatuses(from).includes(String(to || '').toLowerCase());
}

export function isTerminal(status) {
  return TERMINAL_STATUSES.has(String(status || '').toLowerCase());
}

export function flowIndex(status) {
  return ORDER_STATUS_FLOW.indexOf(String(status || '').toLowerCase());
}

// Returns advance | side-step (cancel) for the active status.
export function advanceStatus(current) {
  const allowed = nextStatuses(current);
  return allowed.find((s) => s !== 'cancelled') || null;
}

export default {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_TRANSITIONS,
  nextStatuses,
  canTransition,
  isTerminal,
  flowIndex,
  advanceStatus,
};
