# Prompt 17 — Cart context and persistence

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
Create the cart state layer: a `CartContext` powered by `useReducer` with localStorage persistence, separate keys for guest vs. logged‑in users, optimistic updates, stock guards, coupon support, and a simple selector hook the rest of the app uses.

## Tasks
1. Create `src/context/CartContext.jsx`:
   - State shape:
     ```js
     {
       items: [{ productId, slug, name, image, price, compareAtPrice, currency, qty, stock }],
       couponCode: null,
       discount: 0,        // computed
       subtotal: 0,        // computed
       tax: 0,             // computed (settings-driven, default 0)
       total: 0,           // computed
       lastUpdatedAt: null,
       isHydrated: false,
     }
     ```
   - Reducer actions: `HYDRATE`, `ADD_ITEM`, `UPDATE_QTY`, `REMOVE_ITEM`, `CLEAR`, `APPLY_COUPON`, `CLEAR_COUPON`, `MERGE_GUEST` (called when a guest signs in to fold guest cart into the user cart; dedupe by `productId`, sum qty capped at stock).
   - On every state change, recompute `subtotal/discount/total` (pure helper `computeTotals(state, settings)`).
2. Persistence:
   - Determine the storage key on every read/write:
     - Logged out → `ti_cart_guest`.
     - Logged in → `ti_cart_user_<id>`.
   - On mount: hydrate from the appropriate key.
   - On auth event (`ti:auth-login`): if a guest cart exists, dispatch `MERGE_GUEST` then save under the user key and clear the guest key.
   - On logout: keep cart under the user key; reset in‑memory state to empty so guest sees an empty cart on the same browser.
3. Stock guards:
   - `addItem(product, qty)` clamps qty to `min(qty, stock)`.
   - `updateQty(productId, qty)` rejects qty > stock and emits a toast "Only N available".
   - When a product loads (e.g. on cart page mount) the cart reconciles: if stored `qty > current stock`, clamp and toast "Quantity adjusted to available stock".
4. Coupon:
   - `applyCoupon(code)` calls `couponService.validate(code, subtotal)`. On success store `couponCode`, `discount`, and `discount type/value`. On error toast the server message.
5. Selectors / hooks:
   - `useCart()` → returns `{ state, addItem, updateQty, removeItem, clear, applyCoupon, clearCoupon, isInCart(productId), getQty(productId), itemCount }`.
   - Memoize derived values to avoid re-renders.
6. Wire `<CartProvider>` once in `MainLayout` (above any consumer). Ensure SSR‑safe by guarding `localStorage` with `typeof window !== 'undefined'`.
7. Replace placeholder cart count badge in `Header` and the wishlist heart count in `ProductCard` with values read from `useCart()` and `useWishlist()` (Wishlist comes in Prompt 20; for now, reference but tolerate `useWishlist` not yet existing — gate with a try/catch or default).
8. Emit a global event on add: `window.dispatchEvent(new CustomEvent('ti:cart-add', { detail: item }))` so the mini cart drawer (Prompt 18) can auto‑open.

## Acceptance criteria
- [ ] `useCart` returns full API and reactive state.
- [ ] Cart persists across reload (localStorage), with separate guest/user keys.
- [ ] Login merges guest cart into user cart and clears guest key.
- [ ] Logout doesn't drop user cart from storage; in‑memory cart resets.
- [ ] Adding more than stock clamps and toasts.
- [ ] Coupon apply uses the service layer; totals recompute correctly.
- [ ] Cart badge in header reflects total qty.

## Suggested commit message
`feat(cart): add CartContext, reducer, persistence, stock guards, guest/user merge`
