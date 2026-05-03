# Prompt 59 — Responsive QA pass

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
Run a methodical responsive QA pass at every required viewport. Fix known problem areas, document the checklist, and verify the entire app reads correctly from 360 px up to 1920 px.

## Tasks
1. Add a small dev‑only `<ResponsiveBadge />` component (under `src/components/common/dev/`) that shows the current breakpoint label in a tiny pill at the bottom‑left of the viewport in `import.meta.env.DEV`. Helpful while QA‑ing.
2. **Viewports to verify** (each visit + screenshot to record): 360, 375, 414, 768, 1024, 1280, 1440, 1920.
3. **Screens to walk through (storefront)** at each viewport:
   - Home (header / hero / mosaic / rails / footer).
   - Shop listing with filters open and closed.
   - PDP with gallery + buybox + accordions + reviews.
   - Cart and Mini cart drawer.
   - Wishlist.
   - Checkout (address / payment / review).
   - Confirmation.
   - Account: profile, orders list/detail, addresses, password.
   - Auth: login/register/forgot/reset.
   - Static: about, contact, faq, privacy, terms, shipping‑returns.
   - Search overlay + Search page.
4. **Screens to walk through (admin)** at each viewport (admin requires `md+`; below that show a calm "Use a tablet or larger" notice):
   - Dashboard, Products list, Product form, Categories, Inventory, Orders list/detail, Customers list/detail, Reviews, Coupons, Settings, Reports, Users.
5. **Known fixes to apply (apply only if reproducible)**:
   - **Header**: at 768 px, the cart icon may overlap the user menu — adjust gap.
   - **PDP gallery**: at 1024 px, ensure the sticky buybox doesn't overlap thumbnails column when zoom hover is active.
   - **Shop filters bottom sheet**: ensure the drag handle and Apply button stay visible while filters scroll.
   - **Checkout summary card**: at 1024 px (just above mobile), ensure it doesn't cause horizontal overflow.
   - **Admin DataGrid**: enforce `overflow-x: auto` on the wrapper; mobile (`< md`) shows a banner "Tap to scroll →".
   - **Admin sidebar drawer**: at 768 px, ensure backdrop covers entire viewport including notch areas (iPhone safe areas via `env(safe-area-inset-*)`).
6. **Touch QA**:
   - Confirm touch targets ≥ 44 px on hamburger, close buttons, quantity steppers, wishlist hearts, table row actions.
   - On `@media (hover: none)`, `ProductCard` shows the always‑visible "Quick add" pill.
7. **Document** the pass in `README.md` under a "Responsive QA" section listing the viewports, the checklist, and the resolution notes.

## Acceptance criteria
- [ ] App renders without horizontal overflow at every required viewport.
- [ ] Documented fixes are applied where reproducible.
- [ ] Touch targets meet the 44 px minimum where users must tap.
- [ ] Admin DataGrid horizontally scrolls on small screens; banner appears.
- [ ] Admin layout shows the "Use a tablet or larger" notice below `md`.
- [ ] `<ResponsiveBadge />` appears only in dev.
- [ ] README "Responsive QA" section is filled.

## Suggested commit message
`fix(responsive): QA pass across viewports; header, PDP, filters, checkout, admin grids`
