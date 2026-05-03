# Prompt 34 — Review, place order, and confirmation

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
Build the final two screens: the Review step (`/checkout/review`) where the user verifies everything and places the order, and the Confirmation page (`/order/confirmation/:id`) shown after a successful purchase.

## Tasks
1. Create `src/features/checkout/pages/CheckoutReviewPage.jsx` at `/checkout/review`:
   - Section header: Cormorant "Review your order" + kicker "Take a final look before we begin.".
   - Stack of read‑only cards with Edit links:
     - **Items** card: each cart line item with image, name, qty, line total. "Edit cart" link → `/cart`.
     - **Delivery address** card: full address summary. "Edit" → `/checkout/address`.
     - **Billing address** card: full address summary or "Same as delivery". "Edit" → `/checkout/address`.
     - **Payment** card: method label, masked details (e.g. `Visa •••• 4242` or `Cash on Delivery` or `Bank transfer`). "Edit" → `/checkout/payment`.
     - **Notes** card: notes if present.
     - **Coupon** card: applied code + discount. Allow removing here.
   - Bottom of form: terms acknowledgement checkbox "I agree to the Terms and Privacy Policy" (links). Disabled "Place order" button until checked.
   - Place order button: brass primary, full width on mobile, 280px on desktop. While `isPlacingOrder`: spinner + label "Placing order…", disabled.
2. Place order behavior (`placeOrder()` in CheckoutContext):
   - Validate everything one more time.
   - If payment method is card, call `paymentService.processPayment(payload)` first; fail loudly on rejection (toast + inline error).
   - On payment OK, call `orderService.create({ items, address, billingAddress, paymentMethod, paymentStatus, notes, couponCode })`. The mock backend decrements stock and assigns an order number.
   - On success: clear cart, clear checkout context, navigate to `/order/confirmation/:id` with the new order id.
   - On failure: surface the server error inline; do not clear cart.
3. Create `src/features/checkout/pages/CheckoutConfirmationPage.jsx` at `/order/confirmation/:id`:
   - Loads the order via `orderService.getById(id)`.
   - Hero block: emerald success badge (small icon), Cormorant headline "Thank you, {firstName}.", subhead "Your pieces are being prepared.".
   - Order number row: large monospaced order number with a small "Copy" icon button that copies to clipboard and shows a brief "Copied" tooltip/toast.
   - Two columns at `md+`:
     - Left: itemized order summary (items + totals).
     - Right: delivery address, billing address (or "Same as delivery"), payment method.
   - Below: "What's next" strip with three small steps (Order received → Being prepared → Ready) using `<StatusPill>` icons. No tracking carrier — just internal lifecycle copy.
   - Below: "Continue shopping" brass primary CTA → `/shop` and "View order details" ghost link → `/account/orders/:id` (only when logged in).
   - For guests: a small offer card "Save your details for next time" with a quick "Create account" form (email already known + name + password). Submitting calls `auth.register` and links the order to the new user via `orderService.linkToUser(id)` (add this method in the order service; mock resolves immediately).
4. Robustness:
   - If a user lands on the confirmation page for an order they don't own (logged in as someone else): show `<EmptyState>` "We can't find this order." with CTA back to `/`. Mock backend uses email to allow guest order viewing.
   - Refreshing the confirmation page works (re‑fetches the order).
   - Disable browser back to /checkout/review after success — replace history entry with the confirmation route on `placeOrder()` success.

## Visual / UX spec
- Review cards: surface background, line border, 24px padding, "Edit" link top‑right.
- Confirmation hero: vertical padding 96px, centered.
- Order number font: `var(--font-mono)`, 32px on desktop / 24px mobile.

## Acceptance criteria
- [ ] Review screen shows all order details with Edit links.
- [ ] Place order disables until terms are checked.
- [ ] Successful placement clears cart + checkout state and routes to the confirmation page (history replaced).
- [ ] Confirmation page renders order details, copy‑to‑clipboard works, "What's next" strip displays.
- [ ] Guest checkout offers post‑purchase account creation.
- [ ] No axios in components.

## Suggested commit message
`feat(checkout): add review step, place order flow, and editorial confirmation page`
