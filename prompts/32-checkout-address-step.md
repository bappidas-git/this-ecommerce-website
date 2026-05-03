# Prompt 32 — Checkout address step

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
Build the address step at `/checkout/address`. Logged‑in users pick from saved addresses (radio cards) or add a new inline. Guests fill the form inline. Includes a "Use as billing address" toggle (off → reveals billing form) and contact info (email + phone) for guests.

## Tasks
1. Create `src/features/checkout/pages/CheckoutAddressPage.jsx`:
   - Section header: Cormorant title "Delivery details", small kicker "Where should we send your pieces?"
   - **Logged‑in flow**:
     - Loads `addressService.list()`. Renders a stack of `AddressRadioCard` items (one per address) and an extra "Add new address" radio card at the bottom.
     - Selecting "Add new address" reveals the `<AddressForm>` (reused from Prompt 29) below the list with a "Save this address for next time" checkbox.
     - Pre‑select the user's default address.
   - **Guest flow**:
     - Renders a "Contact" card first: email (required) + phone (required) + "Save my information for next time" checkbox (informational; explains an account will be offered post‑purchase).
     - Then renders `<AddressForm>` inline.
   - Below the shipping section: a single section "Billing address" with a `Billing same as shipping` checkbox (default true). When unchecked, reveals a second `<AddressForm>` for billing.
2. Page footer:
   - Two buttons: `Back to bag` ghost (left) → `/cart`; `Continue to payment` brass primary (right). Disabled until form passes validation.
   - On submit:
     - Logged‑in & existing address: `setAddress(selectedAddress)` in CheckoutContext.
     - Logged‑in & new address with "Save": call `addressService.create(payload)` first.
     - Guest: just store payload in CheckoutContext (no remote create).
     - Then `goNext()`.
3. AddressRadioCard:
   - 1px line border, padding 16px.
   - Radio button at left, address summary in the middle, "Edit" text link on the right that opens `<AddressForm>` in an `<AppDialog>`.
   - Selected card uses brass border (2px) and subtle brass tint background.
4. Validation:
   - All address fields use the same yup schema from Prompt 29.
   - For guests, also require `email` (valid format) and `phone`.
   - On submit failure, scroll the first invalid field into view and call `setFocus`.
5. Persistence behavior:
   - On page mount, hydrate the form from `CheckoutContext` so refresh restores state.
   - Live update CheckoutContext on each valid blur so the order summary's address preview (Prompt 34 review) is current.
6. SEO: `<Seo title="Checkout — Address | THIS Interiors" noindex />`.

## Visual / UX spec
- Mobile: full‑width sections stacked with 24px vertical rhythm. Buttons full‑width, "Continue" first (above "Back").
- Desktop: max‑width 720px form column.
- Saved addresses get a small brass "Default" chip on the default one.

## Acceptance criteria
- [ ] Logged‑in users can pick a saved address or add a new one (with optional save).
- [ ] Guests see a contact card and can fill the form inline.
- [ ] Billing same‑as‑shipping toggle reveals/hides the billing form.
- [ ] Validation prevents Continue until address (and billing if separate) is valid.
- [ ] CheckoutContext receives the address on submit and `goNext()` navigates to payment.
- [ ] Refreshing the page restores the form state from CheckoutContext / saved addresses.

## Suggested commit message
`feat(checkout): add address step with saved/inline forms and billing toggle`
