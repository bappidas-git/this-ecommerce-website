# Prompt 31 — Checkout layout and stepper

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
Build the dedicated `<CheckoutLayout>` and the three‑step stepper. Establish a `CheckoutContext` that owns checkout state across steps (persisting in `sessionStorage`), enforces step order, and renders a sticky order summary on `md+`, with an expandable bottom bar on mobile.

## Tasks
1. Refine `src/components/layout/CheckoutLayout.jsx`:
   - Slim header: wordmark logo (links to `/`), centered "Secure checkout" with brass padlock icon, right‑aligned "Continue shopping" link → `/cart`.
   - 12‑column body: 8 cols main / 4 cols summary at `lg+`. Single column at `md` and below; on mobile the summary collapses into a sticky bottom bar.
   - Slim footer: "Encrypted checkout · Need help? contact@thisinteriors.com".
2. Create `src/context/CheckoutContext.jsx`:
   - State: `{ step, address, billingSameAsShipping, payment, notes, couponCode, isPlacingOrder, error }`.
   - Persist to `sessionStorage` under `ti_checkout` (cleared on confirmation or after 24h).
   - Methods: `setAddress`, `setPayment`, `setNotes`, `goNext`, `goPrev`, `goToStep(n)` (only allowed if previous steps are valid), `placeOrder()`, `reset()`.
   - Validation helpers: `isAddressValid()`, `isPaymentValid()` — used to gate routes.
3. Create `src/features/checkout/components/StepperBar.jsx`:
   - Three steps: `Address` (1) → `Payment` (2) → `Review` (3).
   - Visual: brass numbered circles with connectors. Active step bold ink; completed step shows brass check; future step muted.
   - Click on a completed step navigates back; future steps are disabled.
   - Mobile variant: simpler three‑dot pill row above the page heading.
4. Create `src/features/checkout/components/OrderSummaryAside.jsx`:
   - Sticky on `lg+` (`top: 96px`).
   - Item list (compact rows with image 56×72), then totals (subtotal/discount/tax/total), coupon block, edit cart link.
   - Hides "Edit cart" while on the Review step.
5. Mobile bottom bar (`MobileOrderBar.jsx`):
   - Fixed bottom, height 64px collapsed. Shows total on the left, "Continue" (brass) on the right.
   - Tapping the total expands a sheet showing the full summary; tap again or swipe down to collapse.
6. Create routes:
   - `/checkout` → redirect to `/checkout/address` if cart not empty; if empty, redirect to `/cart`.
   - `/checkout/address`, `/checkout/payment`, `/checkout/review` — render the corresponding step (Prompts 32–34 fill them).
   - `/checkout/confirmation/:id` exists but renders inside `<CheckoutLayout>`.
7. Route guards:
   - Reaching `/checkout/payment` without a valid address redirects to `/checkout/address` (and queues a toast "Please add a delivery address first.").
   - Reaching `/checkout/review` without a valid payment selection redirects to `/checkout/payment`.
8. Animations:
   - Step transitions: 220 ms cross‑fade with 6px upward slide.
   - Respect `prefers-reduced-motion`.
9. Allow guest checkout:
   - Wrap routes in a guard that requires either auth or a guest checkout flag (`CheckoutContext.allowGuest = true`). For now `allowGuest` defaults to `true`. Account creation is offered post‑purchase but optional.

## Visual / UX spec
- Page padding 32px desktop / 16px mobile inside `<Container>`.
- Stepper bar: 56px tall, 1px line bottom border.
- Summary card surface, line border, `--shadow-2` on `lg+`.
- Bottom bar elevated `--shadow-3`.

## Acceptance criteria
- [ ] `<CheckoutLayout>` wraps all `/checkout/*` and `/order/confirmation/*` routes.
- [ ] `CheckoutContext` persists in `sessionStorage` and survives reload.
- [ ] StepperBar reflects progress, allows backward navigation only.
- [ ] Order summary appears on the right at `lg+` and as a collapsible bottom bar on mobile.
- [ ] Route guards block out‑of‑order navigation with friendly toasts.
- [ ] Empty cart redirects to `/cart`.

## Suggested commit message
`feat(checkout): add checkout layout, stepper, context, sticky summary, and guards`
