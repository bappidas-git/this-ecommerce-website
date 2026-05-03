# Prompt 35 — Product reviews

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
Build the product reviews section that anchors at `#reviews` on the PDP. Includes a rating summary with distribution bars, a list of published reviews with filter/sort, and a "Write a review" form gated to verified buyers. Submission is optimistic with revert on error.

## Tasks
1. Create `src/features/reviews/components/ReviewsSection.jsx` and CSS module:
   - Wraps everything inside a `<Section id="reviews">`.
   - Top: `RatingSummary` block.
   - Right of summary on `md+`: "Write a review" CTA button (brass primary), or a small "Sign in to review" link if unauth.
   - Below: `ReviewsToolbar` (filters + sort) and `ReviewsList`.
2. `RatingSummary.jsx`:
   - Big number (Cormorant 56px) `4.8` with rating stars below.
   - Distribution bars 5★ → 1★: each row shows `5★ ████████░░ 64%` using `--color-line` track and brass fill.
   - Total review count caption ("Based on 248 reviews").
3. `ReviewsToolbar.jsx`:
   - Filter by stars (5 chips, multi‑select).
   - Filter "Verified buyers only" toggle.
   - Sort dropdown: `Most helpful`, `Newest`, `Highest rated`, `Lowest rated`. URL state via `useSearchParams` keyed under `reviews_*` prefix to avoid colliding with shop filters.
4. `ReviewsList.jsx`:
   - Renders `ReviewItem` cards with: avatar (placehold.co `B8924F` initials), reviewer name, location (city, country), date, verified badge if applicable, rating stars, title, body text, optional "Helpful?" with thumbs‑up count and toggle.
   - Pagination: 10 per page, "Load more" button instead of numbered pagination for editorial feel.
   - Empty: `<EmptyState>` "No reviews yet — be the first.".
5. `WriteReviewDialog.jsx`:
   - Opened by the CTA. `<AppDialog>` size `md`.
   - Form (RHF + yup):
     - `rating` (required, 1–5 stars; uses `Rating` primitive).
     - `title` (required, 4–100 chars).
     - `body` (required, 10–800 chars). Inline character counter.
   - Verified buyer guard: when the user is logged in but **has not** purchased the product, the dialog renders `<EmptyState>` instead, "Reviews are open to verified buyers." with a "Browse the collection" CTA. Determine purchase via a small `useHasPurchased(productId)` hook that calls `orderService.hasPurchased({ productId })` (add this method to orderService and a mock endpoint `/orders/has-purchased?product_id=...`).
   - Optimistic insert: appends a `pending` review at the top of the list immediately; if the API fails, rollback and toast the error.
   - Backend default review status is `pending` — show a hint after submission "Thank you. Your review will appear once reviewed by our team."
6. PDP integration:
   - PDP's rating row links to `#reviews` and `#reviews .write-cta`.
   - "Read all reviews" anchor link in PDP's buybox sets `location.hash = '#reviews'` and scrolls smoothly.
7. Helmet (PDP): also include `aggregateRating` in product JSON‑LD using the values from the rating summary.

## Visual / UX spec
- Distribution bar height 6px, radius pill, fill brass.
- ReviewItem: 1px line border bottom on each item; 24px vertical padding; avatar 40×40.
- Verified badge: small emerald chip "Verified buyer".

## Acceptance criteria
- [ ] Reviews section anchored at `#reviews` on the PDP.
- [ ] Rating summary, toolbar, list, and dialog all render correctly.
- [ ] URL params for review filters/sort do not collide with shop filters.
- [ ] Write‑review form is gated to verified buyers; the form maps server errors to fields.
- [ ] Optimistic insertion + rollback works.
- [ ] Helpful toggle is optimistic.

## Suggested commit message
`feat(reviews): add reviews section with summary, filters, and verified-buyer write form`
