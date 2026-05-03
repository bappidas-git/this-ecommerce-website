# Prompt 50 — Admin reviews moderation

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
Build review moderation at `/admin/reviews`: tabs for Pending, Published, Rejected; a list with a side drawer detail; bulk approve and reject; and instant publish/unpublish toggles.

## Tasks
1. Create `src/admin/pages/reviews/ReviewsModerationPage.jsx`:
   - Breadcrumbs `[{label:'People'}, {label:'Reviews'}]`.
   - `<AdminPageHeader>` title "Reviews", description "Moderate customer reviews."
   - Tabs: Pending (default), Published, Rejected, with counts in chips.
2. Filter row: search (text or product name), rating multi‑select, verified toggle, date range, sort select.
3. List rendered as `ReviewRow` cards (not a DataGrid — better for prose):
   - Each row: rating stars, title, snippet (≤ 240 chars), product thumbnail + name (link), reviewer name + verified chip, createdAt, status pill.
   - Click row → opens `<AppDrawer>` from the right with the full review and actions.
4. `ReviewDetailDrawer.jsx`:
   - Header: product name + link, rating, reviewer.
   - Body: full title + body, attached metadata (orderId if any, helpful count).
   - Actions row: `Approve` (brass, only for pending), `Reject` (error ghost, only for pending), `Unpublish` (only for published), `Restore` (only for rejected).
   - Action calls `adminReviewService.update(id, { status })`. Optimistic; toast result.
5. Bulk actions:
   - Multi‑select via per‑row checkbox.
   - Sticky bar with "{N} selected" + `Approve all` and `Reject all` buttons.
   - Bulk approve uses `adminReviewService.bulkUpdate({ ids, status: 'published' })`. Toast with undo (8s) that flips them back to `pending`.
6. Empty / loading / error states for each tab.
7. Permissions:
   - `viewer` is read‑only; action buttons hidden.
   - `manager` and `admin` can moderate.
8. Helmet: `<Seo title="Reviews | Admin" noindex />`.

## Visual / UX spec
- Tabs: brass underline indicator on active.
- Status pill colors: pending warning, published success, rejected error.
- Side drawer width 480px desktop, full‑width on mobile, with sticky action footer.

## Acceptance criteria
- [ ] Tabs accurately reflect counts and lists.
- [ ] Side drawer opens with full review and the right actions for the row's current status.
- [ ] Bulk approve works and shows undo toast.
- [ ] All actions are optimistic and revert on error.
- [ ] Permissions enforced.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add reviews moderation with tabs, side drawer detail, bulk approve`
