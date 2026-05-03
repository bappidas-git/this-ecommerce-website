# Prompt 47 — Admin orders list

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
Build the admin orders list at `/admin/orders`: a stat row, filters, a DataGrid with quick status updates (with optional note), and CSV export. No shipping fields anywhere — orders move through a status workflow only.

## Tasks
1. Create `src/admin/pages/orders/OrdersListPage.jsx`:
   - Breadcrumbs `[{label:'Sales'}, {label:'Orders'}]`.
   - `<AdminPageHeader>` title "Orders", description, actions: "Export CSV" (ghost). No "New order" button.
   - Stat row: 4 cards — Today's revenue, Today's orders, Pending fulfilment, Cancelled this week.
2. Filter row:
   - Search (order number or customer email/name).
   - Status multi‑select (pending, confirmed, preparing, ready, completed, cancelled).
   - Payment method select (all / card / cod / bank_transfer).
   - Payment status select (paid / pending / refunded / failed).
   - Date range picker.
3. DataGrid columns: number (mono link), date, customer (name + email), total (right‑aligned mono), payment status pill, status pill, items count, row actions (View, Quick status update).
4. Quick status update:
   - Row action button opens an anchored popover:
     - Select next status from a list of valid transitions (use a small state machine: see Prompt 48).
     - Optional note textarea (≤ 280 chars).
     - "Update" button calls `adminOrderService.updateStatus(id, { status, note })`.
   - Optimistic update of the row.
5. CSV export:
   - On click, downloads a CSV of the current filtered set (server returns `?format=csv` blob; mock backend supports it). Use a tiny client helper to trigger download.
6. Empty / error / loading overlays.
7. Helmet: `<Seo title="Orders | Admin" noindex />`.
8. Permissions:
   - `viewer` — read‑only; quick status update is hidden.
   - `manager` and `admin` — can update status, refund, cancel.

## Visual / UX spec
- Status pill colors mirror storefront `StatusPill` mapping but adjusted for dark admin surfaces (slightly desaturated).
- Payment status pill: paid → success, pending → muted, refunded → warning, failed → error.
- Row hover: brass tint 4%.

## Acceptance criteria
- [ ] Orders list with filters/sort/pagination via URL state.
- [ ] Stat row reflects the current filter range (or "today" if no range — call out the assumption clearly with a small caption).
- [ ] Quick status update popover offers only valid transitions and optimistically updates the row.
- [ ] CSV export downloads a file matching current filter.
- [ ] Permissions enforced.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add orders list with filters, stat row, quick status update, CSV export`
