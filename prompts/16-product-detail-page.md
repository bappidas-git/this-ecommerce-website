# Prompt 16 — Product detail page

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
Build the Product Detail Page (PDP) at `/products/:slug`: gallery with thumbnails and zoom, sticky buybox with quantity stepper and add‑to‑cart, accordions, related products rail, recently viewed rail, and full SEO with JSON‑LD product schema.

## Tasks
1. Create `src/features/product/pages/ProductDetailPage.jsx`. Loads via `useProduct(slug)` (new hook under `src/hooks/useProduct.js`) which calls `productService.getBySlug`.
2. Layout (two columns at `md+`, stacked on mobile):
   - **Left**: `Gallery` component
     - Main 4:5 image with subtle zoom on hover (`background-position` move on cursor) — desktop only.
     - Thumbnails column on the left (vertical) for `md+`; horizontal scroll strip below main on mobile.
     - Click thumbnail to swap main image; arrow keys cycle when gallery has focus.
     - Lightbox: clicking the main image opens an `AppDialog` with full‑screen image and prev/next.
     - Badges overlay top‑left (`New`, `Sale`, `Limited`).
   - **Right**: `Buybox` component
     - Eyebrow with category name → links to category.
     - Cormorant headline (32–44px) product name.
     - `<PriceTag size="lg">` with compareAt.
     - Rating row (links to `#reviews`).
     - Short summary (3–4 lines from product description's first paragraph).
     - **Quantity stepper** + brass primary "Add to bag" button (full width on mobile).
     - Stock indicator: green dot "In stock", warning "Only N left" when stock ≤ 5, muted "Sold out" when 0.
     - Wishlist button (heart) labeled "Save to wishlist".
     - Trust strip: small icons + tiny text (Crafted in Dubai · Hand‑finished · Free local delivery on AED 500+).
3. **Sticky buybox**: on `md+`, the right column becomes `position: sticky; top: 96px;` so it stays in view while the left scrolls. On mobile, after scrolling past the buybox, show a slim sticky bottom bar with price + "Add to bag" button.
4. **Accordions** under the gallery (collapsible, MUI `Accordion`):
   - Details (full description paragraphs + tags as chips).
   - Materials & Care (from attributes).
   - Dimensions (from attributes; render a small key/value grid).
   - Shipping & Returns (static copy from settings).
5. **Related products rail** below accordions: uses `productService.getRelated(productId)`; reuses `<ProductRail>`.
6. **Recently viewed rail** below related: maintains a list in `localStorage` under `ti_recently_viewed` (cap 12, dedupe, push current product on mount). Reuses `<ProductRail>`.
7. **Reviews entry**: scroll anchor `#reviews` and a "Read all reviews" link near the rating row. The full reviews section is built in Prompt 35.
8. **SEO + JSON‑LD**:
   - `<Seo>` with title, meta description, canonical, OG image (first product image).
   - JSON‑LD `Product` schema with `name`, `image`, `description`, `sku`, `offers` (price, currency, availability), `aggregateRating`. Inject via `<script type="application/ld+json">` inside Helmet.
9. **Loading and error**:
   - Skeleton: gallery placeholder + 3 text lines + price stub + button stub.
   - 404: when API returns "not found", render `<EmptyState>` with "We couldn't find that piece." + back‑to‑shop CTA.

## Visual / UX spec
- Two‑column 6/6 split at `md`, 7/5 (image-heavier) at `lg+`.
- Gallery thumbnail size 72×72 desktop, 64×64 mobile.
- Buybox max width 480px on `lg+`; left‑align text.
- Add to bag button: 56px tall, brass, pill radius. Loading state shows spinner + "Adding…".

## Acceptance criteria
- [ ] PDP renders with all sections and links to category from the eyebrow.
- [ ] Gallery zoom works on desktop hover; thumbnails swap main image; arrow keys navigate.
- [ ] Sticky buybox on `md+`; sticky bottom bar on mobile after scroll.
- [ ] All four accordions render product attribute data without crashes when fields are missing.
- [ ] Related and Recently viewed rails appear below accordions.
- [ ] JSON‑LD product schema is present in the page source.
- [ ] Stock indicator behaves correctly across `>5`, `1–5`, `0` cases.

## Suggested commit message
`feat(product): add PDP with gallery, sticky buybox, accordions, related, JSON-LD`
