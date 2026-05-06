export const INVENTORY_STATUS = Object.freeze({
  out: 'out',
  low: 'low',
  healthy: 'healthy',
});

export const INVENTORY_STATUS_LABELS = Object.freeze({
  out: 'Out',
  low: 'Low',
  healthy: 'Healthy',
});

// Maps inventory status → existing StatusPill tone keys.
// 'cancelled' → error · 'ready' → warning · 'completed' → success
export const INVENTORY_STATUS_PILL = Object.freeze({
  out: 'cancelled',
  low: 'ready',
  healthy: 'completed',
});

export const INVENTORY_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'out', label: 'Out' },
  { value: 'low', label: 'Low' },
  { value: 'healthy', label: 'Healthy' },
];

export const INVENTORY_SORT_OPTIONS = [
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'name:asc', label: 'Name A → Z' },
  { value: 'name:desc', label: 'Name Z → A' },
  { value: 'stock:asc', label: 'Stock low → high' },
  { value: 'stock:desc', label: 'Stock high → low' },
];

export const INVENTORY_REASON_OPTIONS = [
  { value: 'restock', label: 'Restock' },
  { value: 'damage', label: 'Damage' },
  { value: 'recount', label: 'Recount' },
  { value: 'manual_correction', label: 'Manual correction' },
  { value: 'other', label: 'Other' },
];

export const INVENTORY_REASON_LABELS = Object.freeze({
  restock: 'Restock',
  damage: 'Damage',
  recount: 'Recount',
  manual_correction: 'Manual correction',
  manual_adjustment: 'Manual adjustment',
  return: 'Return',
  order_fulfillment: 'Order fulfillment',
  other: 'Other',
});

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function deriveInventoryStatus(stock, threshold = DEFAULT_LOW_STOCK_THRESHOLD) {
  const s = Number(stock) || 0;
  const t = Number.isFinite(Number(threshold)) ? Number(threshold) : DEFAULT_LOW_STOCK_THRESHOLD;
  if (s <= 0) return INVENTORY_STATUS.out;
  if (s <= t) return INVENTORY_STATUS.low;
  return INVENTORY_STATUS.healthy;
}
