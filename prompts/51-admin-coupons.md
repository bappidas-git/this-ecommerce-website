# Prompt 51 — Admin coupons

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
Build coupons admin at `/admin/coupons`: a list with a computed status pill, an add/edit dialog with a code generator, scheduling, usage limits, target scope, and verification of validation behavior end‑to‑end with the storefront.

## Tasks
1. Create `src/admin/pages/coupons/CouponsListPage.jsx`:
   - Breadcrumbs `[{label:'Sales'}, {label:'Coupons'}]`.
   - `<AdminPageHeader>` title "Coupons", actions: "New coupon" (brass).
   - Filter row: search by code, status (Active / Scheduled / Expired / Disabled), type (Percent / Fixed).
   - DataGrid columns: code (mono), type, value, scope (All / Categories / Products), startsAt, endsAt, used / max, status pill (computed), row actions (Edit, Disable/Enable, Delete).
2. **Computed status pill** logic (helper `src/admin/utils/computeCouponStatus.js`):
   - `disabled` if `!isActive`.
   - `expired` if `endsAt < now`.
   - `scheduled` if `startsAt > now`.
   - `out_of_uses` if `redeemedCount >= maxRedemptions`.
   - else `active`.
3. **CouponFormDialog.jsx** (used for both new and edit):
   - Fields (RHF + yup):
     - `code` (required, 3–20 chars, uppercase letters/digits) with a "Generate" button next to it that creates a 8‑char random code.
     - `type` (`percent | fixed`), required.
     - `value` (required; if percent, 1–100; if fixed, ≥ 1 AED).
     - `minSubtotal` (optional ≥ 0).
     - `maxRedemptions` (optional integer ≥ 1).
     - `startsAt`, `endsAt` (date pickers; `endsAt > startsAt` required).
     - `appliesTo` (`all | categories | products`); when categories/products, show a multi‑select with search.
     - `isActive` switch.
   - Submit calls `adminCouponService.create / update`. Map server errors to fields.
4. List actions:
   - Disable/Enable toggles `isActive` via `adminCouponService.update(id, { isActive })`.
   - Delete shows confirm dialog. If `redeemedCount > 0`, warn that the coupon has been used.
5. End‑to‑end verification:
   - Document and verify that the storefront cart's `Apply coupon` calls `couponService.validate(code, subtotal)` and respects all rules (minSubtotal, schedule, redemption cap, scope).
   - For scope = categories or products, mock backend computes discount only on matching items' subtotal.
6. Permissions:
   - `manager` and `admin` can manage; `viewer` read‑only.
7. Helmet: `<Seo title="Coupons | Admin" noindex />`.

## Visual / UX spec
- Code field uses `var(--font-mono)` and uppercases on blur.
- Status pill colors: Active success, Scheduled brass, Expired muted, Disabled error, Out of uses warning.
- Form sections: Code, Discount, Limits, Schedule, Scope.

## Acceptance criteria
- [ ] CRUD flows work end‑to‑end with optimistic UI.
- [ ] Computed status reflects schedule, isActive, and usage cap.
- [ ] Code generator produces valid codes; validation enforces uppercase alnum + length.
- [ ] Storefront `Apply coupon` works for percent/fixed and respects scope.
- [ ] Permissions enforced; viewer cannot mutate.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add coupons CRUD with code generator, scope, computed status, e2e validation`
