# Prompt 36 — Global search

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
Build the global search experience: a header overlay with debounced live results, recent searches and trending suggestions, and a full `/search` results page. Refactor the shop's listing block into a reusable `<ProductBrowser>` so search reuses it.

## Tasks
1. Refactor: extract `src/features/shop/components/ProductBrowser.jsx` from `ShopPage`. It accepts:
   - `state`, `setFilters`, `setSort`, `setPage`, `clearAll`, `meta`, `items`, `isLoading`, `isError`, `refetch`.
   - Renders the toolbar, sidebar, active chips, grid, pagination.
   - Both `ShopPage` and `SearchPage` consume it.
2. Create `src/features/search/components/SearchOverlay.jsx`:
   - Triggered from header search button (`UIContext.openSearch`).
   - Renders a full‑width overlay sliding from the top, surface background, max width 960 px centered.
   - Top: search input (large, 24px, no border, brass focus underline). Right: close button.
   - Debounced 250ms live results below the input:
     - "Suggestions" group (top 5 product matches) — each row: thumbnail, name, category, price.
     - "Categories" group (3 matches max).
     - "On sale" small rail row when query is empty.
   - Empty (no query): two columns — left "Recent searches" (chips, click to search; persisted in `localStorage` under `ti_recent_searches`, max 8); right "Popular right now" (top tags from settings or seed data).
   - Pressing Enter navigates to `/search?q=...` and closes overlay.
   - Pressing `↑/↓` highlights suggestions; Enter on a suggestion navigates to its PDP/category.
   - Closes on Escape, outside click, route change.
3. Create `src/features/search/pages/SearchPage.jsx` at `/search`:
   - Header: Cormorant title `"Results for "{q}"`. Result count caption.
   - Reuses `<ProductBrowser>` with the shop's `useShopState` (initialized from URL `q`).
   - When `q` is empty, redirects to `/shop`.
   - Empty results: `<EmptyState>` with title "Nothing matches yet.", suggestion chips for related queries (random subset of trending), and a "Clear search" CTA.
4. Persist recent searches:
   - On Enter in overlay or on search page mount with non‑empty `q`, add the query to `ti_recent_searches` (dedupe, cap 8).
   - "Clear" link in the recent searches block clears the list.
5. Helmet:
   - Search page: title `"Results for "{q}" | THIS Interiors"`, `noindex`.
6. Header keyboard:
   - `Cmd/Ctrl + K` opens the search overlay (handled in `UIContext`).

## Visual / UX spec
- Overlay backdrop: ink at 36% opacity with blur 8px.
- Search input height 64px, brass underline 2px on focus.
- Suggestion row hover background: `--color-line` at 30%.

## Acceptance criteria
- [ ] Header search opens the overlay; Cmd/Ctrl+K also opens it.
- [ ] Live results debounce 250ms and abort previous requests.
- [ ] `/search` reuses `<ProductBrowser>` and respects URL state.
- [ ] Recent searches persist in localStorage and clear correctly.
- [ ] Keyboard navigation in overlay works (`↑/↓/Enter/Esc`).
- [ ] Empty query state shows recent + popular columns.

## Suggested commit message
`feat(search): add header overlay, search page, ProductBrowser refactor`
