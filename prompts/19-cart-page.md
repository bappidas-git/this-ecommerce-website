# Prompt 19 — Cart page

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
Build the dedicated `/cart` page: full line items table, coupon block, summary card, recommendation rail, and a sticky mobile checkout bar. Reconcile stock when the page mounts and surface a banner if anything changed.

## Tasks
1. Create `src/features/cart/pages/CartPage.jsx`. Layout (two columns at `lg+`, single column below):
   - Page header: Cormorant headline "Your bag" + small caption "{itemCount} pieces".
   - **Left**: line items table.
   - **Right**: order summary card (sticky).
2. Line items table (`CartItemsTable.jsx`):
   - Each row: image (96×120), product info column (name link, attributes, "Move to wishlist" link, "Remove" link), quantity stepper, price column (line total), and a small unit price helper underneath.
   - Empty state: editorial `<EmptyState>` with title "Your bag is empty.", brass CTA "Browse the collection".
   - Reconciliation: on mount, call `productService.list({ ids: [...productIds] })` (or per‑item) and check stock vs. cart qty; if any line was clamped, render a banner at top: `<Alert severity="info">Some quantities were updated to reflect availability.</Alert>` for 6s.
3. Coupon block (`CouponInput.jsx`):
   - Input + "Apply" button. On success, show chip with code + small × to remove. On failure, show inline server error message.
   - "Have a code?" toggle hides the input by default.
4. Summary card (`OrderSummary.jsx`):
   - Subtotal, Discount (if any), Tax (if any), Estimated total. Display "Free shipping on orders over AED 500" hint.
   - Brass "Checkout" button (full width, 56px). Secondary "Continue shopping" link.
   - Trust strip below: secure payments, free returns within 14 days, lifetime studio support.
5. Recommendations rail below the columns (`<ProductRail>` with bestsellers, eyebrow "You may also love").
6. Mobile sticky bar: bottom of viewport, height 64px, slides up after scrolling past the summary card. Shows total + brass "Checkout" button.
7. Wire `<RouterLink>` "Move to wishlist" to call `useWishlist().add(product)` then `useCart().removeItem(productId)`.
8. SEO: `<Seo title="Your bag | THIS Interiors" noindex />` so cart isn't indexed.

## Visual / UX spec
- Summary card surface background, 1px line border, padding 24px.
- Line items table uses 1px line dividers, 24px vertical padding per row.
- Coupon chip uses brass soft variant.
- Reconciliation banner uses warning palette but kept calm.

## Acceptance criteria
- [ ] `/cart` renders the page with all sections.
- [ ] Adjusting qty updates totals immediately (optimistic via cart context).
- [ ] Removing a line shows undo via the toast helper.
- [ ] Applying an invalid coupon surfaces the server error inline.
- [ ] Stock reconciliation runs on mount and shows banner only when something changed.
- [ ] Mobile sticky bar appears after scrolling past summary on mobile.
- [ ] No axios in components.

## Suggested commit message
`feat(cart): add cart page with line items, coupon, summary, recommendations, sticky bar`
