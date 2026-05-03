# Prompt 30 — My orders list and detail

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
Build the customer orders list and detail screens. Customers can filter by status, paginate, view a detail page with items, totals, addresses, payment, and (where allowed) reorder or cancel. No shipping carrier or tracking — orders progress through a status lifecycle managed by admin.

## Tasks
1. Create `src/features/account/pages/OrdersListPage.jsx` at `/account/orders`:
   - Filter chip row (above the table): `All`, `Pending`, `Confirmed`, `Preparing`, `Ready`, `Completed`, `Cancelled`. Active chip uses brass solid.
   - Search input by order number ("Search by order #...") with `q` URL param.
   - Date range filter (MUI `DateRangePicker` from `@mui/x-date-pickers` if available; otherwise two `DatePicker`s).
   - Result list rendered as `OrderRow` cards (not a DataGrid — keep it editorial):
     - Each row: order number (mono), date, status pill, total, item thumbnails strip (up to 5), `View order →` link.
   - Pagination 10 per page with URL state (`page`, `per_page`).
2. Create `src/features/account/components/StatusPill.jsx`:
   - Maps order status to color and label:
     - `pending` — muted ink, "Order received"
     - `confirmed` — brass, "Confirmed"
     - `preparing` — emerald, "Being prepared"
     - `ready` — emerald, "Ready"
     - `completed` — success, "Completed"
     - `cancelled` — error, "Cancelled"
3. Create `src/features/account/pages/OrderDetailPage.jsx` at `/account/orders/:id`:
   - Header: Cormorant title "Order {number}", subtitle "{date} • {itemCount} pieces". Status pill on the right.
   - Two columns at `md+`:
     - **Left**: items list (image + name link + qty + line total), then accordions for "Shipping address" (read‑only summary), "Billing address", "Payment" (method, last 4 if card, paid/unpaid).
     - **Right**: summary card (subtotal, discount, tax, total), action buttons:
       - `Reorder` (brass) — calls `orderService.reorder(id)` which seeds the cart with available items (may clamp by stock). On success, navigate to `/cart`.
       - `Cancel order` (error ghost) — only when status is `pending` or `confirmed`. Opens confirm dialog; on confirm, `orderService.cancel(id)` updates status. Show success toast.
       - `Need help?` (ghost) — `/contact?orderNumber=...`.
   - "Internal notes" are not shown to customers (those are admin‑only). Customer‑visible notes (if any in the future) would appear here, but for now only render order metadata.
4. Loading and empty states:
   - List loading: 6 skeleton rows mirroring the order row layout.
   - Empty: editorial `<EmptyState>` "No orders yet." + CTA "Begin browsing".
   - Detail loading: skeleton variants of the columns.
   - Detail not found / 403: `<EmptyState>` "We couldn't find this order." + back to orders.
5. Helmet titles: list `My orders | THIS Interiors`, detail `Order {number} | THIS Interiors`. Both `noindex`.
6. Reorder behavior:
   - For each item, attempt to add to cart. If a product is no longer available or stock is insufficient, skip it and collect a warning. After processing, navigate to `/cart` and show a toast summarizing what was added and what was skipped.

## Visual / UX spec
- Order row card: 1px line border, 16px padding, hover background `--color-surface`.
- Item thumbnails strip: 5 small 32×32 images with overlap −8px; show `+N` chip if more items.
- Status pill is small and pill‑shaped, color from StatusPill mapping.

## Acceptance criteria
- [ ] List page filters by status and date range, paginates, and reflects filters in the URL.
- [ ] StatusPill component is reused on every order screen.
- [ ] Detail page shows items, addresses, payment, and totals correctly.
- [ ] Reorder seeds cart and surfaces a clear summary toast on completion.
- [ ] Cancel button visible only for `pending`/`confirmed`; calls service and updates UI.
- [ ] No shipping/tracking UI anywhere.
- [ ] No axios in components.

## Suggested commit message
`feat(account): add orders list and detail with status pill, reorder, conditional cancel`
