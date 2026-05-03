# Prompt 57 — Skeletons and optimistic UI

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
Replace top‑level spinners with editorial skeletons that mirror final layouts so resolved data doesn't shift the page. Audit cart, wishlist, and admin status toggles to confirm they're optimistic with revert‑on‑error.

## Tasks
1. Build skeletons for screens that currently show plain spinners or blank states:
   - **HomePage** — hero placeholder bar (grayed image with eyebrow + headline shimmer), category mosaic grid skeletons, two product rail skeletons.
   - **ShopPage / SearchPage** — already have card skeletons; verify density and layout match resolved state.
   - **PDP** — gallery placeholder, buybox text lines, accordions collapsed, related rail skeleton.
   - **CartPage** — three line item skeletons + summary card skeleton.
   - **WishlistPage** — grid skeleton matching the resolved layout.
   - **OrdersListPage** (account) — 6 row skeletons.
   - **OrderDetailPage** (customer) — column skeletons.
   - **AccountLayout pages** — section header skeleton + form field skeletons.
   - **Admin DashboardPage** — KPI card skeletons + chart placeholders.
   - **Admin DataGrid pages** — header skeleton + 10 row skeletons (use the linear progress at top while data refreshes).
2. Build a tiny `<TextSkeleton lines={n} />` and `<RectSkeleton w h r />` helpers under `src/components/common/skeletons/` to reduce duplication. Both use a consistent shimmer animation (1.4s linear, brass at 6% opacity over `--color-line`).
3. Audit optimistic UI:
   - **CartContext**: confirm add/remove/update qty are optimistic, with revert + toast on error.
   - **WishlistContext**: confirm toggles are optimistic and revert on API failure for logged‑in users.
   - **Admin orders list quick status update**: confirm row is updated immediately and reverts on failure.
   - **Admin reviews moderation**: confirm approve/reject are optimistic.
   - **Admin inventory inline edits**: confirm cells revert on failure.
   - **Admin coupons enable/disable toggle**: confirm optimistic.
   - For each, add a small inline error toast on revert: e.g. "Couldn't update — please try again."
4. Skeleton timing:
   - Add a `useDeferredLoading(isLoading, delay = 120ms)` helper that delays showing skeletons for very fast loads, preventing flashes. Use it in screens where data typically resolves fast (mini cart, wishlist, etc.).
5. Documentation:
   - In `src/components/common/skeletons/README.md`, document the convention: skeletons must mirror final layout dimensions to within ±2px to prevent layout shift; never use `<CircularProgress>` as a screen‑level loader.

## Acceptance criteria
- [ ] Every page that loads data has a skeleton matching its resolved layout (no top‑level spinners).
- [ ] Optimistic actions in cart/wishlist/admin status toggles all revert with an error toast on failure.
- [ ] `useDeferredLoading` prevents skeleton flash for fast loads.
- [ ] Skeleton geometry matches resolved layout to within ~2px (CLS minimal).
- [ ] No regressions in any prior screen.

## Suggested commit message
`refactor(ux): replace spinners with editorial skeletons; audit optimistic actions`
