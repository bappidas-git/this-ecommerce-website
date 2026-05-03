# Prompt 15 — Shop filtering, sorting, pagination, URL state

## Project context (do not change)
- Brand: THIS Interiors (Dubai). Reference: https://thisinteriors.com/
- We are building an e‑commerce store for small decor items + an admin panel.
- Admin is reachable only via `/admin/*` with its own login at `/admin/login`.
- Brand feel: editorial, premium, calm. Cream + brass + ink + emerald. Cormorant Garamond + Inter.
- Stack: React 18 (Vite), JS only (no TS), MUI v5, CSS Modules, Framer Motion, react‑router‑dom v6, react‑hook‑form + yup, axios, json‑server with custom Express middleware, swap‑ready for Laravel + MySQL via `VITE_API_BASE_URL`.
- All images via `https://placehold.co/` using brand colors.
- API envelope: `{ data, meta }`; errors: `{ message, errors }`; query params snake_case.
- Storefront persists `ti_token`; admin persists `ti_admin_token` — two separate sessions.

## Brand tokens (use these — never invent)
- Colors: `#F7F3ED` bg, `#FFFFFF` surface, `#1B1A17` ink, `#4A453E` ink‑2, `#8C8678` muted, `#E5DED2` line, `#B8924F` brass, `#9A7836` brass‑2, `#1F4034` emerald, `#C8A29A` rose, `#B0382A` error, `#3F6B4F` success, `#B8862B` warning.
- Fonts: Cormorant Garamond (display), Inter (UI), JetBrains Mono (admin numerals).
- Radii: 4 / 8 / 14 / 24 / 999.

## Universal rules
1. Do not break work from previous prompts. Edit surgically; preserve existing files.
2. JS/JSX only — no `.ts` / `.tsx`.
3. No inline hex in components — use `theme.palette.*` or CSS variables.
4. Components → hooks → services → axios. Never call axios from components.
5. Mobile‑first; verify at 360, 375, 768, 1024, 1440 px.
6. Accessibility: semantic HTML, alt text, focus visible, AA contrast.
7. All placeholder images via `placehold.co` with brand colors.

## Goal of this prompt
Wire all shop state (filters, sort, page, search) into URL search params and into the data layer. Filter changes are debounced; in‑flight requests are aborted; pagination scrolls back to the top; the category route locks the category filter; back/forward works.

## Tasks
1. Create `src/features/shop/state/useShopState.js`:
   - Owns the canonical filter object and reads/writes `useSearchParams`.
   - Shape:
     ```js
     {
       q: '',
       categoryId: null,           // overridden by route :slug if present
       minPrice: null, maxPrice: null,
       colors: [], materials: [],
       inStock: false, onSale: false,
       sort: 'featured',
       page: 1, perPage: 12,
     }
     ```
   - Exposes `state`, `setFilters(partial)`, `setSort(s)`, `setPage(p)`, `clearAll()`, and a memoized `serialized` value used by `useProducts`.
   - Round‑trips to URL params with snake_case keys: `q`, `category_id`, `min_price`, `max_price`, `colors`, `materials`, `in_stock`, `on_sale`, `sort`, `page`, `per_page`. Empty/default values are pruned.
   - Reads `:slug` route param; if present, resolves to `categoryId` via `useCategories()` and forces it (sidebar Category group becomes read‑only and shows the active category at the top).
2. Update `useProducts` to:
   - Accept the serialized filter object.
   - Debounce 250ms on filter changes (not on `page`/`sort`).
   - Use an `AbortController` per call; cancel previous on new call.
   - Return `{ items, meta, isLoading, isError, error, refetch }`.
3. Wire `FilterSidebar`:
   - Each control reads from `state` and writes via `setFilters`.
   - Color and Material chip lists come from a static map for now (the categories' typical attributes seeded in `db.json`); later prompts can switch to a `/api/facets` endpoint.
4. Wire `ToolbarBar`:
   - Sort dropdown reads/writes `state.sort` via `setSort`.
   - Result count reads from `meta.pagination`.
5. Wire `ActiveFilterChips`:
   - Renders a chip for every non‑default filter value (price range as one chip, each color/material as its own chip, etc.).
   - Removing a chip calls `setFilters` with the cleared key. "Clear all" calls `clearAll`.
6. Wire `PaginationBar`:
   - `count = meta.pagination.totalPages`, `page = state.page`.
   - On change, `setPage(p)` and smoothly scroll to top of grid (`scrollIntoView({ behavior: 'smooth', block: 'start' })`).
7. Loading transitions:
   - On filter/sort change: keep current items visible at 60% opacity for ≤ 300ms, then swap when fresh items arrive.
   - On page change: skeleton swap is OK because layout shouldn't shift (constant card sizes).
8. URL behavior:
   - Back/forward updates state via `useSearchParams`. Scroll restoration uses route key.
   - If page > totalPages, clamp to last page and update URL.
9. Document the serializer in `src/features/shop/state/serializeFilters.js` with comments listing every accepted key — useful when Prompt 53 expands reports filters.

## Acceptance criteria
- [ ] All shop filters read/write the URL with snake_case keys.
- [ ] `/shop/:slug` locks the category filter to the resolved id.
- [ ] Changing a filter debounces (250ms), aborts the previous request, and scrolls grid to top on page change.
- [ ] Active filter chips remove correctly and "Clear all" resets to defaults.
- [ ] Pagination clamps to `totalPages` if URL is out of range.
- [ ] No axios in components; everything goes through `useProducts` → `productService`.

## Suggested commit message
`feat(shop): wire URL state, debounced filters, abort, pagination scroll-to-top`
