# Prompt 20 — Wishlist context and page

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
Build the wishlist state and the standalone `/wishlist` page. State is local for guests (localStorage) and synced with the API for logged‑in users. The page lets users browse saved items, jump back to the PDP, or move pieces to the bag.

## Tasks
1. Create `src/context/WishlistContext.jsx`:
   - State: `{ productIds: number[], isHydrated, isSyncing }`.
   - Actions: `HYDRATE`, `TOGGLE`, `ADD`, `REMOVE`, `CLEAR`, `MERGE_GUEST`.
   - Storage keys mirror the cart pattern: `ti_wishlist_guest` and `ti_wishlist_user_<id>`.
   - For logged‑in users, on `TOGGLE`, optimistically update local state, then call `wishlistService.toggle(productId)`. On failure, revert and toast the server message.
   - On login, fetch server wishlist via `wishlistService.get()` and merge with guest local list (union, dedupe).
   - On logout, reset to empty in‑memory; keep user key in storage.
2. Hook `useWishlist()` exposes `{ productIds, isWishlisted(id), toggle(product), add(product), remove(productId), clear, count }`.
3. Wire the heart on `ProductCard` to `useWishlist().toggle(product)` and read `isWishlisted` from the context. Optimistic toggle with revert on error.
4. Create `src/features/account/pages/WishlistPage.jsx` mounted at both `/wishlist` and `/account/wishlist` (account version uses `<AccountLayout>`; standalone uses `<MainLayout>`):
   - Header: Cormorant "Your wishlist" + count caption.
   - Empty: `<EmptyState>` with editorial copy and "Discover the collection" CTA.
   - Grid of `ProductCard` items at `density="standard"`.
   - Each card has an additional overlay button on hover/focus: brass "Move to bag" — adds to cart and removes from wishlist on success. On mobile, this button is rendered below the price as a small ghost button.
   - Bulk actions bar above the grid (only on `md+`): "Move all to bag" and "Clear wishlist" (with confirm dialog).
5. The grid items resolve full product data via `productService.list({ ids: [...productIds] })` — the wishlist context only stores ids. Cache the resolved products in memory while on the page.
6. Real‑time sync: on `ti:auth-login` event, the wishlist context refetches.
7. Accessibility: each card's heart button announces the new state correctly when toggled (`aria-pressed`, plus a polite live region announcement).

## Visual / UX spec
- Grid: 2 cols xs, 2 cols sm, 3 cols md, 4 cols lg.
- "Move to bag" overlay: brass, pill, anchored bottom‑center on the image.
- Bulk action buttons aligned right with subtle dividers.

## Acceptance criteria
- [ ] Wishlist persists across reload, with separate guest/user keys.
- [ ] Login merges and refetches; logout resets in‑memory.
- [ ] Heart toggle is optimistic and reverts on API failure for logged‑in users.
- [ ] `/wishlist` and `/account/wishlist` both render the page using their respective layouts.
- [ ] "Move to bag" adds to cart and removes from wishlist atomically.
- [ ] Empty state shows on a fresh wishlist.
- [ ] No axios in components.

## Suggested commit message
`feat(wishlist): add WishlistContext, persistence, sync, and wishlist page`
