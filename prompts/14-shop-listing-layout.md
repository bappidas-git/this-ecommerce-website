# Prompt 14 — Shop listing layout

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
Build the shop layout shell — page header (with optional category banner), filter sidebar (desktop), sort/breadcrumb toolbar, responsive grid, and mobile bottom‑sheet pickers. **Do not** wire query state yet — that's Prompt 15. Use a static placeholder list from `useProducts({})` so the layout is testable.

## Tasks
1. Create `src/features/shop/pages/ShopPage.jsx`. URL: `/shop` (all) and `/shop/:slug` (category).
2. Create the layout components under `src/features/shop/components/`:
   - **ShopHeader** — Cormorant headline ("Shop the collection" or category name), kicker (category description if applicable), small breadcrumb above. When on a category route, include a hero band with a placehold.co category banner image (1600x500) on the right or above title.
   - **FilterSidebar** (desktop only, `md+`) — sticky sidebar with collapsible groups: Category (radio), Price (min/max numeric inputs + slider), Color (multi‑select chips), Material (multi‑select chips), Availability (`In stock`, `On sale` toggles), Search within results (text input). Includes a "Clear all" link at top.
   - **ToolbarBar** — left: result count ("Showing 1–12 of 36"); right: Sort dropdown, View toggle (`grid`/`list` — list is dense rows). Sticky below header on scroll.
   - **ActiveFilterChips** — row of chips reflecting current filters; each chip × removes itself; "Clear all" link.
   - **ProductGrid** — responsive grid: 2 cols xs, 2 cols sm, 3 cols md, 4 cols lg, 4–5 cols xl. 24px gap.
   - **PaginationBar** — numeric pagination (MUI `Pagination`) centered below grid. On click, scroll to top of grid smoothly.
   - **MobileFilterSheet** and **MobileSortSheet** — `<AppDrawer anchor="bottom">` with the filter and sort options stacked, primary "Apply" CTA at bottom. Triggered by buttons that replace the desktop sidebar/sort on `xs–sm`.
3. Compose `ShopPage.jsx`:
   - `<MainLayout>` already wraps. Inside, render `<ShopHeader>`, then a 12‑column grid: 3 columns sidebar, 9 columns content. On `xs–sm`, single column.
   - Sticky toolbar at top of content column (just below header).
   - Loading: render 12 `<ProductCard.Skeleton />` in the grid.
   - Empty: `<EmptyState>` with title "Nothing matches yet", description, "Clear all filters" CTA.
   - Error: `<ErrorState>` with retry.
4. Sort options array (used now and in Prompt 15): `['featured', 'newest', 'price_asc', 'price_desc', 'rating', 'bestselling']` with friendly labels.
5. Add a `<Seo>` block: title `"{Category} — Shop | THIS Interiors"` or `"Shop | THIS Interiors"`.

## Visual / UX spec
- Sidebar width 280px, sticky `top: 96px`, scrollable internally if content overflows.
- Toolbar: 56px tall, white surface, 1px line bottom border on scroll.
- Mobile sheets: 80vh max height, drag‑to‑dismiss handle at the top.
- Grid card max width 320px to keep imagery generous on large viewports.

## Acceptance criteria
- [ ] `/shop` and `/shop/:slug` both render the shop layout.
- [ ] Filter sidebar visible only on `md+`; mobile uses bottom sheets.
- [ ] Sort dropdown shows the six options with the correct labels.
- [ ] Skeleton, empty, and error states all reachable in dev.
- [ ] No state wiring yet — that lands in Prompt 15.

## Suggested commit message
`feat(shop): add listing layout shell, filter sidebar, toolbar, mobile sheets, grid`
