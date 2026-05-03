import { COLOR_OPTIONS, MATERIAL_OPTIONS } from '../constants.js';

const labelFor = (options, value) => {
  const found = options.find((o) => o.value === value);
  return found ? found.label : value;
};

const formatPrice = (n) => `AED ${Number(n).toLocaleString()}`;

/**
 * Translate a shop state object into the array of removable chips shown above
 * the grid. Each chip describes which filter key it represents and how to
 * clear it: removal handlers in the page just spread `chip.clear` into
 * setFilters().
 *
 * Locked categories (driven by /shop/:slug) are intentionally not chipped —
 * the breadcrumb / page header already makes that filter visible.
 */
export function buildFilterChips(state, { categories = [], isCategoryLocked = false } = {}) {
  if (!state) return [];
  const chips = [];

  if (state.q) {
    chips.push({
      group: 'q',
      value: state.q,
      label: `“${state.q}”`,
      clear: { q: '' },
    });
  }

  if (!isCategoryLocked && state.categoryId) {
    const cat = categories.find((c) => String(c.id) === String(state.categoryId));
    chips.push({
      group: 'categoryId',
      value: state.categoryId,
      label: cat ? cat.name : 'Category',
      clear: { categoryId: null },
    });
  }

  if (state.minPrice != null || state.maxPrice != null) {
    const minLabel = state.minPrice != null ? formatPrice(state.minPrice) : 'AED 0';
    const maxLabel = state.maxPrice != null ? formatPrice(state.maxPrice) : '∞';
    chips.push({
      group: 'price',
      value: 'price',
      label: `${minLabel} – ${maxLabel}`,
      clear: { minPrice: null, maxPrice: null },
    });
  }

  for (const value of state.colors || []) {
    chips.push({
      group: 'color',
      value,
      label: `Color: ${labelFor(COLOR_OPTIONS, value)}`,
      clear: { colors: (state.colors || []).filter((v) => v !== value) },
    });
  }

  for (const value of state.materials || []) {
    chips.push({
      group: 'material',
      value,
      label: `Material: ${labelFor(MATERIAL_OPTIONS, value)}`,
      clear: { materials: (state.materials || []).filter((v) => v !== value) },
    });
  }

  if (state.inStock) {
    chips.push({
      group: 'inStock',
      value: 'inStock',
      label: 'In stock',
      clear: { inStock: false },
    });
  }

  if (state.onSale) {
    chips.push({
      group: 'onSale',
      value: 'onSale',
      label: 'On sale',
      clear: { onSale: false },
    });
  }

  return chips;
}

export default buildFilterChips;
