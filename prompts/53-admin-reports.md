# Prompt 53 — Admin reports

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
Build the admin reports area at `/admin/reports`: a single page with a date range picker and a "compare to previous period" toggle, plus six report blocks — sales over time, sales by category, top products, top customers, coupon performance, inventory turnover. CSV export per block.

## Tasks
1. Create `src/admin/pages/reports/ReportsPage.jsx`:
   - Breadcrumbs `[{label:'Site'}, {label:'Reports'}]`.
   - `<AdminPageHeader>` title "Reports", actions: `DateRangePicker` with quick presets, `Compare to previous period` switch, `Export all (CSV)` ghost button.
   - Stat row (4 cards) summarizing totals for the selected range: Revenue, Orders, AOV, Customers. Each card shows the previous‑period delta when compare is on.
2. Six report blocks rendered as `AdminCard`s in a 12‑col grid:
   - **Sales over time** (12 cols on `xs–md`, 8 cols on `lg+`): `recharts` `<AreaChart>` with brass primary line. Toggle granularity (Day / Week / Month).
   - **Sales by category** (12 cols on `xs–md`, 4 cols on `lg+`): horizontal bar chart with category names; brass bars.
   - **Top products** (6 cols on `lg+`): table with rank, product, units sold, revenue. Click product → edit page.
   - **Top customers** (6 cols on `lg+`): table with rank, customer, orders, lifetime value. Click → customer detail.
   - **Coupon performance** (6 cols): table with code, type/value, redemptions, discount given.
   - **Inventory turnover** (6 cols): table with product, starting stock, ending stock, sold, days of cover.
3. Each block has a small "Export CSV" link in its header that downloads only that block's data filtered to the selected range.
4. Service layer:
   - Each block calls a method on `adminReportService` that maps to the corresponding endpoint in `endpoints.admin.reports.*`.
   - All requests share the same `range` (snake_case `start_date`, `end_date`) plus `compare_previous=true|false`.
5. URL state:
   - Range and compare flag persist via `useSearchParams`. Switching tabs in admin elsewhere preserves the report state if the user comes back.
6. Loading and error per block — never block the entire page on one failure.
7. Permissions:
   - `viewer`, `manager`, `admin` all have read access; nothing destructive here.
8. Helmet: `<Seo title="Reports | Admin" noindex />`.

## Visual / UX spec
- Charts: brass line/fill, emerald accents for compare‑previous overlay (dotted line), grid 8% opacity, axes muted.
- Tables: sticky headers; mono numerals; right‑aligned numeric columns.
- Compare delta chips: success/error pills with arrows.

## Acceptance criteria
- [ ] All six blocks render with the brand chart styling.
- [ ] Compare‑previous overlays appear on the time‑series chart and as deltas on each table/card.
- [ ] CSV export per block downloads correctly for the chosen range.
- [ ] Range and compare flag persist via URL state.
- [ ] Errors in one block don't crash other blocks.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add reports page with six blocks, compare-to-previous, and CSV export`
