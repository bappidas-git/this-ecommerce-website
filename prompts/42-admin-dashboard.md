# Prompt 42 — Admin dashboard

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
Build the admin dashboard at `/admin` — a single‑screen overview with date range picker, four KPI cards (with sparklines), revenue area chart, orders donut, recent orders table, top products list, and a low‑stock strip.

## Tasks
1. Create `src/admin/pages/DashboardPage.jsx` at `/admin`:
   - On mount, set breadcrumbs: `[{label: 'Overview'}]`.
   - `<AdminPageHeader>` with title "Overview", description, and actions: a `DateRangePicker` (`@mui/x-date-pickers`) with quick presets (Today, 7d, 30d, 90d, This year, Custom).
   - Loads aggregated data via `adminReportService.dashboard({ start, end })` (add a method that fetches `salesOverTime`, `topProducts`, etc. concurrently and bundles them).
2. Layout grid (12 columns):
   - Row 1: 4 KPI cards (3 cols each at `lg+`, 2x2 on `md`, stacked on `sm`). Each `KpiCard` shows:
     - Eyebrow label, big number (mono on numerals, weight 500), small delta vs. previous period (success/error chip with arrow), and a small `recharts` sparkline area (no axes).
     - KPIs: Revenue, Orders, New customers, AOV.
   - Row 2: 8 cols revenue area chart (`AdminCard` titled "Revenue") + 4 cols donut (`AdminCard` titled "Orders by status"), each with a small "View report" link to `/admin/reports`.
   - Row 3: 8 cols recent orders table (last 8 orders with `StatusPill`, click row → `/admin/orders/:id`) + 4 cols top products list (top 5 by revenue or qty, with thumbnails).
   - Row 4: low‑stock strip (full width). Lists products with stock ≤ threshold; click → `/admin/products/:id`. Empty state: "All stock looks healthy.".
3. `AdminCard.jsx` (under `src/admin/components/`):
   - Surface admin (`#16201D`), 1px border `#243030`, padding 20px, radius `--radius-md`.
   - Slots: title, action, children.
4. Charts:
   - Revenue: `recharts` `<AreaChart>` with brass gradient fill (linear gradient `#B8924F` 24% → 0%), grid lines 8% opacity cream.
   - Donut: `<PieChart>` with brand colors mapped to statuses (`pending` muted, `confirmed` brass, `preparing` emerald, `ready` warning, `completed` success, `cancelled` error). Custom label in center showing total orders.
5. Loading state:
   - Skeleton placeholders for each card matching final geometry.
6. Empty / error:
   - On any sub‑request failure, render `<ErrorState>` inside the affected card with a small "Retry" button.
   - When date range has no orders: show calm "No orders in this range." inside each chart.
7. Permission gating:
   - Wrap dashboard with `<RequireAdmin area="dashboard" />`. Already gated by sidebar visibility, but keep belt and braces.

## Visual / UX spec
- Numerals weight 500, mono.
- Delta chip: small pill, success or error tone with up/down arrow.
- Card spacing 16px gap on the grid.
- Date range picker: brass focus, ink chips for presets.

## Acceptance criteria
- [ ] Dashboard renders on `/admin` and respects role gating.
- [ ] Date range picker updates all cards via a single bundle call.
- [ ] All four KPI cards render values and sparklines.
- [ ] Revenue area + orders donut render with brand colors.
- [ ] Recent orders rows link to order detail; top products link to product edit.
- [ ] Low‑stock strip lists items with stock ≤ threshold and is empty‑safe.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add dashboard with KPIs, sparklines, area chart, donut, low-stock strip`
