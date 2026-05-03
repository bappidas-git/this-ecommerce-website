# Prompt 43 — Admin products list

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
Build the admin products list at `/admin/products` using MUI's DataGrid. Includes filters, search, bulk actions, URL state, server‑side pagination/sort, and an "Undo" toast for bulk archive.

## Tasks
1. Create `src/admin/pages/products/ProductsListPage.jsx`:
   - `<AdminPageHeader>` title "Products", description "Manage your catalog.", actions: "Export CSV" (ghost), "New product" (brass) → `/admin/products/new`. Set breadcrumbs `[{label: 'Catalog'}, {label: 'Products'}]`.
   - `ProductsToolbar` row: search input, category select, status select (Active / Draft / Archived), stock select (In stock / Low / Out), price min/max.
   - DataGrid columns: image (40×50 thumbnail), name (link to edit), SKU, category, price (compareAt as strikethrough beneath), stock (with low/out chip), status pill, updatedAt, row actions (3‑dot menu).
   - Row actions: View (storefront link), Edit, Duplicate, Archive/Unarchive, Delete (with confirm dialog, gated by `canWrite`).
2. URL state via `useSearchParams`:
   - All filter, search, sort, and pagination state syncs to URL with snake_case keys.
   - On filter change, `setPage(1)` and refetch.
3. Server‑side mode for DataGrid:
   - `paginationMode="server"`, `sortingMode="server"`. Page size options: 10, 25, 50.
   - Use `adminProductService.list(params)` returning `{ items, meta }`.
4. Bulk actions:
   - Show a sticky toolbar above the grid when ≥1 row is selected: "{N} selected" + actions: "Archive", "Unarchive", "Set category…", "Delete".
   - Bulk archive: optimistic remove from current view + toast "Archived {N} products" with an "Undo" action that restores them via a single `unarchive` call. Toast lasts 8s.
   - Bulk delete: confirm dialog enumerating count.
5. Empty / error / loading:
   - DataGrid `slots` for `noRowsOverlay` (custom `<EmptyState>`), `errorOverlay` (`<ErrorState>`), `loadingOverlay` (linear progress at top).
6. Performance:
   - Debounce search 250ms.
   - Memoize columns; use `getRowId={r => r.id}`.
7. Helmet: `<Seo title="Products | Admin" noindex />`.

## Visual / UX spec
- DataGrid header background admin surface, 1px line bottom border `#243030`.
- Row hover: subtle brass tint 4%.
- Status pill colors: Active emerald, Draft muted, Archived ink‑2.
- Bulk toolbar slides in from the top with 200ms.

## Acceptance criteria
- [ ] `/admin/products` lists products with server‑side pagination/sort/filters.
- [ ] Filters round‑trip via URL search params.
- [ ] Bulk archive shows undo and works correctly.
- [ ] Empty/error/loading overlays match brand.
- [ ] Permissions: `viewer` cannot trigger destructive actions; menu hides them.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add products list with DataGrid, filters, bulk actions, undo`
