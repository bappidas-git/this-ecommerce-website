# Prompt 33 — Checkout payment step

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
Build the payment step at `/checkout/payment`. Three method options gated by settings: simulated card form (Luhn + expiry + CVV), Cash on Delivery, and Bank transfer. Designed so a real gateway swap (Stripe/HyperPay/Telr) replaces only one service file later.

## Tasks
1. Create `src/features/checkout/pages/CheckoutPaymentPage.jsx`:
   - Section header: Cormorant "Payment" + small kicker "All transactions are encrypted."
   - Reads `settings.payment` from `useSettings()`. Renders only enabled methods (`cardEnabled`, `codEnabled`, `bankTransferEnabled`).
   - **Method picker** as radio cards stacked:
     - **Card** (icon row of supported brands): when selected, expands the `CardForm` below.
     - **Cash on Delivery**: when selected, shows a small note "Pay in cash to our courier on delivery." plus an optional fee chip if the settings include `codFee`.
     - **Bank transfer**: when selected, shows the bank details (from `settings.payment.bankDetails`) and instructions; sets `paymentStatus: 'pending'` on submission.
2. `CardForm.jsx`:
   - Fields (RHF + yup):
     - `cardNumber` — required, mask "0000 0000 0000 0000", validates **Luhn** + length 13–19.
     - `cardName` — required, 2–80 chars, alpha + space + accents.
     - `expiry` — required, mask "MM/YY", checks not expired (current month or later).
     - `cvv` — required, 3–4 digits.
     - `saveCard` — checkbox (UI only, doesn't actually persist; explains future feature).
   - Render brand icon (Visa/Mastercard/Amex) detected from card number prefix.
   - Inline server‑error mapping on 422.
3. Notes block (always rendered, below methods):
   - Optional `notes` textarea (max 280 chars) — stored in CheckoutContext as `notes` and on the order on placement.
4. Action footer: `Back to address` (ghost) and `Review order` (brass primary). On submit, validate, then `setPayment(payload)` and `goNext()`.
5. Service swap path (document inline):
   - Add `src/api/services/paymentService.js` with a `processPayment(payload)` method that today calls a mock endpoint `/payments/simulate` returning `{ ok: true, transactionId: 'sim_xxx' }`.
   - When swapping to Stripe/HyperPay/Telr, replace this single file (and possibly add a tokenization step). The order placement flow stays the same.
6. Persistence:
   - On mount, hydrate selected method and form fields from CheckoutContext.
   - Mask the stored card number — only keep last 4 in CheckoutContext for display on the Review step.
7. Accessibility:
   - Card form fields have `inputMode="numeric"` and `autocomplete="cc-number" | "cc-name" | "cc-exp" | "cc-csc"`.
   - Errors associated via `aria-describedby`.

## Visual / UX spec
- Method radio card: 1px line border; selected uses 2px brass border and brass‑tinted background.
- Card form layout: number full width, name full width, expiry + cvv side‑by‑side at `md+`.
- "Powered by" small line at the bottom of each method group is intentionally absent — keep the look clean.

## Acceptance criteria
- [ ] Only enabled methods (per settings) appear.
- [ ] Card form validates with Luhn and expiry; CVV restricted to 3–4 digits.
- [ ] Brand icon updates as card number is typed.
- [ ] On submit, payment payload is stored in CheckoutContext (with masked card number) and the user advances to Review.
- [ ] Notes textarea stores into CheckoutContext.
- [ ] `paymentService.processPayment` is the single method to swap for a real gateway.

## Suggested commit message
`feat(checkout): add payment step with card (Luhn), COD, bank transfer, swap-ready service`
