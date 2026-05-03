# Prompt 18 — Mini cart drawer

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
Build the mini cart drawer that opens from the cart icon in the header (and auto‑opens after add‑to‑cart). It shows line items with quick controls, subtotal, and CTAs to view cart or check out, with delightful but calm motion.

## Tasks
1. Create `src/components/layout/MiniCartDrawer/MiniCartDrawer.jsx` and CSS module:
   - Anchored right, full height, width 92vw max 420px.
   - Header: "Your bag" title, total item count chip, close button.
   - Body: scrollable list of `MiniCartLine` items. Empty state when 0 items.
   - Footer (sticky): subtotal row (label left, price right), shipping note ("Shipping calculated at checkout"), `View bag` (ghost) and `Checkout` (brass) full‑width buttons.
2. `MiniCartLine.jsx`:
   - 80×80 image (placehold.co already in cart item), name (Cormorant 16px, click → PDP), qty stepper (small), unit price right‑aligned.
   - Trash icon button to remove line. Confirms removal via subtle inline undo bar that shows for 4s after click ("Removed. Undo").
3. Open/close behavior:
   - Hooks into `UIContext.isCartOpen / openCart / closeCart`.
   - Auto‑opens on the global event `ti:cart-add`. Auto‑closes on Escape, backdrop click, route change, or after 8s if user is idle (no interaction). The auto‑close timer pauses on hover/focus inside the drawer.
4. Animation:
   - Backdrop fades 220ms; panel slides from right `translateX(100% → 0)` 280ms `--motion-ease`.
   - New line item entrance: 6px slide + fade, 220ms.
5. Empty state:
   - Centered illustration placeholder (use the `ShoppingBagOutlined` icon big), eyebrow "Your bag is empty", kicker "Begin with something timeless.", CTA "Browse the collection" → `/shop`.
6. Recommendations strip (if 0 items): a small horizontal rail of 4 bestseller products fetched via `useProducts({ sort: 'bestselling', perPage: 4 })`. Compact density.
7. Accessibility:
   - `role="dialog"`, `aria-modal="true"`, `aria-label="Shopping bag"`.
   - Focus trap; first focus is the close button; Escape closes; focus returns to the cart icon.
8. Wire `Header`'s cart button to call `openCart()` instead of navigating. Long‑press / right‑click is unaffected (link still goes to `/cart` for assistive users — keep `<a href="/cart">` as the underlying element with `onClick` preventing default and opening the drawer).

## Visual / UX spec
- Surface background. Top header has a 1px line bottom border.
- Footer has a top line border and a soft `--shadow-2`.
- Subtotal label: muted; value: ink, weight 500.

## Acceptance criteria
- [ ] Drawer opens from header cart icon and on `ti:cart-add` event.
- [ ] Auto‑close timer behaves correctly (8s idle, pauses on interaction).
- [ ] Body scroll is locked while open; focus is trapped; Escape closes.
- [ ] Empty state shows the recommendations rail.
- [ ] Removing a line shows an inline undo for 4s.
- [ ] No inline hex; reuses `AppDrawer`, `AppButton`, `QuantityStepper`.

## Suggested commit message
`feat(cart): add mini cart drawer with auto-open, undo, recommendations`
