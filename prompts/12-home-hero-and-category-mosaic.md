# Prompt 12 — Home hero and category mosaic

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
Build the home page's two opening sections: an editorial **Hero** and an asymmetric **CategoryMosaic** that introduces the product universe. Both pull copy and images from the public `useSettings()` hook with safe defaults.

## Tasks
1. Create `src/features/home/components/Hero/Hero.jsx` and CSS module.
   - Full‑width section, 92vh on `md+`, 80vh on mobile.
   - Background image fills 100%: `https://placehold.co/1600x900/1F4034/F7F3ED?text=THIS+Interiors&font=playfair` by default, overridden by `settings.homepage.heroImage`.
   - Overlay: linear gradient ink → transparent at 35% so text stays readable.
   - Content block, left‑aligned, max width 640px:
     - Eyebrow: "A Studio in Dubai" (brass).
     - Display headline (Cormorant 56–88px responsive): "Pieces that quiet a room." — overridable via `settings.homepage.heroTitle`.
     - Kicker (Inter 18px cream, 64ch max): subhead from settings.
     - CTA cluster: brass primary "Shop the collection" → `/shop`, emerald ghost link "Read our story" → `/about`.
   - Subtle parallax: image translates `y: 0 → -40px` as the user scrolls (use Framer Motion `useScroll` + `useTransform`). Disable when `prefers-reduced-motion`.
   - Trust strip beneath the content block on `md+` only: 3 small badges with eyebrow text ("Crafted in Dubai" · "Free local delivery on AED 500+" · "Hand‑finished"). Hidden on `xs–sm` to keep hero quiet.
2. Create `src/features/home/components/CategoryMosaic/CategoryMosaic.jsx` and CSS module.
   - Loads featured categories via `useCategories()` hook (created here under `src/hooks/useCategories.js`) which calls `categoryService.list()` and caches in memory.
   - Layout uses CSS Grid:
     - `md+`: 12 columns, 2 rows. Place 4 hero tiles in a curated asymmetric pattern (e.g. tile 1 spans 7 cols × 2 rows; tile 2 spans 5 cols × 1 row top‑right; tile 3 spans 3 cols × 1 row bottom‑right‑left; tile 4 spans 2 cols × 1 row bottom‑right). Choose any pattern that reads gallery‑like.
     - `sm`: 2 cols, 4 tiles stacked.
     - `xs`: 1 col, 4 tiles stacked.
   - Each tile (`CategoryTile.jsx`):
     - Background image (placehold.co category card) with low ink overlay.
     - Eyebrow "CATEGORY", Cormorant tile title (28–40px), small "Discover →" link.
     - Tile is a single Link to `PATHS.category(slug)`.
     - Hover: image scales 1 → 1.04 over 800ms ease‑out; overlay deepens.
3. Add a `<SectionHeader>` directly above the mosaic with eyebrow "The collection", title "Curated edits for considered homes", `align='center'`.
4. Use Framer Motion `whileInView` for tile entrance: stagger `0.06`, fade 8px up, once.
5. Wire `<Hero />` and `<CategoryMosaic />` into `src/features/home/pages/HomePage.jsx`. Add Helmet `<Seo>` with title "THIS Interiors — Pieces that quiet a room." and the standard description.

## Visual / UX spec
- Hero text shadow only if needed for contrast at default placeholder (test AA contrast).
- Mosaic gap 16px on mobile, 24px on desktop.
- Tiles maintain a 4:5 minimum aspect ratio on mobile; on desktop the asymmetric pattern overrides ratios.

## Acceptance criteria
- [ ] Hero loads default settings and overrides cleanly when `settings.homepage.*` changes.
- [ ] Parallax respects `prefers-reduced-motion`.
- [ ] Category mosaic displays 4 categories in an asymmetric grid on `md+`, stacked on mobile.
- [ ] All images via `placehold.co` with brand colors.
- [ ] Each tile links to its category route.
- [ ] No inline hex.

## Suggested commit message
`feat(home): add editorial hero with parallax and asymmetric category mosaic`
