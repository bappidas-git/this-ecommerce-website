# Prompt 11 — Canonical ProductCard

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
Build the single canonical `ProductCard` used by Home, Shop, Search, Wishlist, Related Products, and Recently Viewed. It must look gallery‑grade, swap to a second image on hover, expose a wishlist heart and a quick‑add pill, and degrade gracefully when sold out.

## Tasks
1. Create `src/components/product/ProductCard/ProductCard.jsx` and `ProductCard.module.css`.
2. Props (validate with `propTypes` import or inline JSDoc):
   - `product` (shape: `{ id, slug, name, price, compareAtPrice, currency, images[], rating, reviewCount, stock, isNew, isOnSale, isLimited }`).
   - `density` (`'standard' | 'compact'`, default `standard`).
   - `showRating` (default true).
   - `onQuickAdd(product)` — optional handler. When omitted, the quick‑add pill is hidden.
   - `onWishlistToggle(product, willBeWishlisted)` — optional.
   - `isWishlisted` (boolean controlled by parent; if undefined, internally falls back to context value).
3. Layout:
   - 4:5 image area (aspect‑ratio CSS), background `--color-line`. The default image fills it; on hover, the second image (if available) fades in over 300ms.
   - Top‑left corner: badge stack — order: `New`, `Sale`, `Limited`. Use `AppBadge`.
   - Top‑right corner: wishlist heart (`AppIconButton`, `FavoriteBorder`/`Favorite`). Optimistic toggle on click; emits `onWishlistToggle`.
   - Hover quick‑add pill anchored bottom‑center inside the image area: brass pill, label "Quick add". Visible on hover and keyboard focus on the card. Sold‑out state replaces it with a muted "Sold out" pill (non‑clickable).
   - Below image: small Eyebrow with category name (optional via `product.category?.name`), then product name in Cormorant 18px ink, then rating row (small star + numeric + `(reviews)` muted), then `<PriceTag>`.
4. Whole card is a router link to `PATHS.product(slug)` except for the heart and quick‑add buttons (use `<Link>` wrapping image+meta block, plus standalone overlay buttons that `e.stopPropagation()`).
5. Variants:
   - `density="compact"` reduces font sizes and hides the rating row.
   - **Skeleton variant**: export `<ProductCard.Skeleton />` for use in loading grids. Mirrors final geometry exactly so layout doesn't shift on resolve.
6. Motion:
   - Card itself: subtle `whileInView` fade‑up 8px, 280ms (in grids; respects `prefers-reduced-motion`).
   - Quick‑add pill: 6px translateY in/out 200ms.
7. Accessibility:
   - The link receives the product's name as the accessible label. Wishlist button: `aria-pressed={isWishlisted}`, label switches between "Add to wishlist" / "Remove from wishlist".
   - Image `alt` is the product name.
   - Quick‑add is a real `<button>` with `aria-label="Add {name} to cart"`.
8. Add a developer preview at `/_kitchen-sink/products` (dev only) that renders four cards (default, sold out, on sale + limited + new, skeleton).

## Visual / UX spec
- Image background `--color-line` to mask placeholder gap.
- Card background `--color-bg` (cream) on home; transparent on shop grid (background comes from page).
- Spacing: 16px between image and meta block.
- Hover lifts no element by default — instead, a 1px brass underline animates beneath the product name; the image second‑frame is the "wow".
- Touch (no hover): show a permanent small "Quick add" outline pill below price on touch devices using `@media (hover: none)`.

## Acceptance criteria
- [ ] Card renders all product data and degrades gracefully when fields are missing.
- [ ] Image swap on hover works only when a second image exists.
- [ ] Wishlist toggle is optimistic and announces state correctly via `aria-pressed`.
- [ ] Sold out replaces quick‑add with a non‑clickable "Sold out" pill.
- [ ] Skeleton variant matches the resolved card's height to within a few px.
- [ ] No inline hex; uses theme/CSS variables.

## Suggested commit message
`feat(product): add canonical ProductCard with hover, wishlist, quick-add, skeleton`
