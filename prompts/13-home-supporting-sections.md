# Prompt 13 — Home supporting sections

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
Add the supporting home sections under the hero and mosaic: New Arrivals rail, Bestsellers rail, Brand Story strip (emerald), Testimonials, and a Newsletter band. All entrances are quiet `whileInView` reveals with `once: true`.

## Tasks
1. Create `src/components/product/ProductRail/ProductRail.jsx` and CSS module — a horizontally scrollable rail used by both rails:
   - Props: `title`, `eyebrow`, `kicker`, `viewAllTo`, `items` (array of products), `loading` (boolean), `emptyHint`.
   - Renders `<SectionHeader>` with optional `cta={<AppButton variant="ghost" to={viewAllTo}>View all</AppButton>}`.
   - Below, a horizontal scroll container (`overflow-x: auto`, scroll‑snap, no scrollbar) containing `ProductCard` items.
   - Two arrow icon buttons (only on `md+`) that scroll the container by one card width with smooth scrolling. Hidden when at start/end.
   - Skeleton state: 6 `<ProductCard.Skeleton />` items.
   - Empty: render `<EmptyState>` with the supplied `emptyHint`.
2. Create `src/features/home/components/NewArrivals.jsx` — uses `useProducts({ sort: 'newest', perPage: 8 })` hook (created here under `src/hooks/useProducts.js`) and feeds the rail.
3. Create `src/features/home/components/Bestsellers.jsx` — uses `useProducts({ sort: 'bestselling', perPage: 8 })`.
4. Create `src/features/home/components/BrandStoryStrip.jsx`:
   - `<Section tone="emerald">` with two‑column layout (`md+`): left image (large placehold.co `1F4034` editorial), right text (Eyebrow "Atelier", Cormorant headline ~40px in cream, kicker, brass CTA "Read the story" → `/about`).
   - Mobile: image stacks above text.
   - Subtle Framer Motion crossfade between two images on the left every 6s (use two layered images, fade with `AnimatePresence`). Pauses on `prefers-reduced-motion`.
5. Create `src/features/home/components/Testimonials.jsx`:
   - 3‑slide carousel of pull quotes. No external carousel lib — use a small `useCarousel` hook (under `src/hooks/`) that exposes `{ index, next, prev, set }` with autoplay 7s.
   - Each slide: large opening quote mark in brass, italic Cormorant 28–36px ink quote, attribution row (small avatar via placehold.co `B8924F`, name, location).
   - Dots beneath, brass active dot.
6. Create `src/features/home/components/NewsletterBand.jsx`:
   - `<Section tone="cream">` (already default) with a centered editorial headline ("Letters from the studio"), kicker, and the same `<NewsletterForm>` component used in the footer (extract to `src/components/common/NewsletterForm.jsx` if needed).
7. Update `src/features/home/pages/HomePage.jsx` to compose all six sections in order: Hero → CategoryMosaic → NewArrivals → BrandStoryStrip → Bestsellers → Testimonials → NewsletterBand.
8. Add helmet meta to home page: title, description, OG image (placehold.co OG card), canonical `/`.

## Visual / UX spec
- Section vertical rhythm: 96px desktop / 56px mobile padding (use `<Section>` defaults).
- Rails: 5 cards visible at 1440px, 4 at 1280px, 3 at 1024px, 2 at 768px, 1.5 at 360px.
- Testimonials autoplay pauses on hover/focus/touch, advances on swipe.

## Acceptance criteria
- [ ] Home page renders all six sections in order with no console warnings.
- [ ] `<ProductRail>` arrows appear only on `md+` and hide at boundaries.
- [ ] All product data flows through `useProducts` (no axios in components).
- [ ] Story strip image crossfades but pauses on reduced motion.
- [ ] Testimonials carousel autoplays, pauses on hover/focus, supports swipe and dots.
- [ ] Newsletter form submits and shows toast feedback.

## Suggested commit message
`feat(home): add supporting sections — rails, brand story, testimonials, newsletter`
