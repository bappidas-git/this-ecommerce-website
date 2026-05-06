export const PRODUCT_STATUS = Object.freeze({
  active: 'active',
  draft: 'draft',
  archived: 'archived',
});

export const PRODUCT_STATUS_LABELS = Object.freeze({
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
});

export const PRODUCT_STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: PRODUCT_STATUS.active, label: PRODUCT_STATUS_LABELS.active },
  { value: PRODUCT_STATUS.draft, label: PRODUCT_STATUS_LABELS.draft },
  { value: PRODUCT_STATUS.archived, label: PRODUCT_STATUS_LABELS.archived },
];

export const STOCK_OPTIONS = [
  { value: '', label: 'Any stock' },
  { value: 'in', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
];

export const LOW_STOCK_THRESHOLD = 5;

// Products in db.json store isActive + status; normalize to a single status field.
export function deriveStatus(product) {
  if (!product) return PRODUCT_STATUS.draft;
  const raw = String(product.status || '').toLowerCase();
  if (raw === 'archived' || raw === 'draft' || raw === 'active') return raw;
  if (product.isArchived) return PRODUCT_STATUS.archived;
  if (product.isActive === false) return PRODUCT_STATUS.draft;
  return PRODUCT_STATUS.active;
}

export function deriveStockTone(stock) {
  const n = Number(stock) || 0;
  if (n <= 0) return 'out';
  if (n < LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}
