# Prompt 46 — Admin inventory

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
Build the inventory management page at `/admin/inventory`: stat cards, an inline‑editable table, bulk save, an "Adjust stock" popover with a reason, and an activity tab showing the inventory log.

## Tasks
1. Create `src/admin/pages/inventory/InventoryPage.jsx`:
   - Breadcrumbs `[{label:'Catalog'}, {label:'Inventory'}]`.
   - `<AdminPageHeader>` title "Inventory", description, actions: "Export CSV" (ghost), "Refresh" (ghost).
   - Tabs: `Levels` (default) and `Activity`.
2. **Levels tab**:
   - Stat cards row: `Total SKUs`, `Out of stock`, `Low stock`, `Healthy`. Mono numerals.
   - Filter row: search by name or SKU, category select, status select (`All`, `Out`, `Low`, `Healthy`), sort select.
   - DataGrid columns: image, name + SKU, category, stock (inline editable number), threshold (inline editable number), status pill (computed), updatedAt, row actions (Adjust, History).
   - Inline edits: pencil icon to start edit, save to apply via `adminInventoryService.update(productId, { stock, lowStockThreshold })`. Optimistic. ESC cancels.
   - Bulk save: when ≥ 1 row is dirty (edited but not saved), show a sticky bar "{N} unsaved changes — Save all / Discard". Saving runs sequential calls or a single `bulkUpdate` (whichever is supported). On success, toast.
3. **Adjust stock popover** (`AdjustStockPopover.jsx`):
   - Triggered by row action. Anchored to the row.
   - Form fields:
     - `delta` (number, can be negative) — required.
     - `reason` (`AppSelect`: Restock, Damage, Recount, Manual correction, Other).
     - `note` (optional, ≤ 200 chars).
   - On submit, calls `adminInventoryService.adjust(productId, payload)` which writes an `inventory_log` row and updates `products.stock`.
   - Optimistic UI; revert on error.
4. **Activity tab**:
   - Reads `inventory_log` via `adminInventoryService.activity({ q, productId, dateRange, page, perPage })`.
   - DataGrid columns: createdAt, product (link), delta (color‑coded green/red), reason, note, user.
5. Permissions:
   - `viewer` sees both tabs read‑only — inline edits and Adjust action are hidden.
   - `manager` can edit stock and adjust.
6. Helmet: `<Seo title="Inventory | Admin" noindex />`.
7. Empty / error / loading states use the standard overlays.

## Visual / UX spec
- Status pill: success (Healthy), warning (Low), error (Out).
- Inline edit cells get a brass underline focus.
- Sticky bulk‑save bar at top of grid, brass background, cream text.
- Activity row hover shows full note in tooltip if truncated.

## Acceptance criteria
- [ ] Levels tab supports inline edits with optimistic save and ESC cancel.
- [ ] Bulk‑save bar shows correct unsaved count and persists across rows.
- [ ] Adjust popover writes a log row and updates stock atomically.
- [ ] Activity tab lists inventory_log entries with filters.
- [ ] Permissions enforce read‑only for `viewer`.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add inventory page with inline edits, bulk save, adjust, activity log`
