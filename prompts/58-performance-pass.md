# Prompt 58 — Performance pass

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
Run a thorough performance pass: lazy‑split routes, preload critical hero, add `loading="lazy"` to non‑critical images, audit dependency weight, and document a baseline Lighthouse run. The goal is fast time‑to‑interaction without sacrificing the brand.

## Tasks
1. **Route code splitting**:
   - Convert each route component import in `AppRoutes.jsx` to `React.lazy(() => import('...'))`.
   - Wrap nested layouts' `<Outlet />` (or top of `AppRoutes`) in `<Suspense fallback={<RouteFallback/>}>` where `RouteFallback` renders the same skeleton geometry as the destination layout (e.g. shop layout fallback shows the toolbar + grid skeletons).
   - Keep critical above‑the‑fold home pieces (Hero, CategoryMosaic) eager‑loaded — split the supporting sections lazily.
2. **Preload critical hero image**:
   - In `HomePage`, use `<Helmet>` to inject `<link rel="preload" as="image" href={heroImage}>`.
   - Mark only the home hero as `fetchpriority="high"`; everything else stays default.
3. **Lazy images**:
   - Audit every `<img>`. Default to `loading="lazy" decoding="async"` except hero/above‑the‑fold images.
   - Where MUI components render images via children, ensure the underlying tag uses `loading="lazy"`.
4. **Fonts**:
   - Switch Google Fonts `@import` to `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com`, and inject `<link rel="stylesheet">` via Helmet so it's discovered earlier.
   - Use `font-display: swap` (Google's URL parameter `&display=swap`) to avoid invisible text.
5. **Bundle audit**:
   - Add `npm run analyze` script using `vite build --mode analyze` and `rollup-plugin-visualizer`. Document threshold expectations in README.
   - Identify any single dependency over 200 KB gzipped and decide whether to keep, replace, or lazy‑load. `recharts` and `@mui/x-data-grid` are heavy and are admin‑only — confirm they're not loaded into the storefront bundle (split via the admin lazy chunks).
   - Tree‑shake `lucide-react` by importing icons individually (`import { ChevronLeft } from 'lucide-react'` is fine; default import is not).
6. **Memoization**:
   - Add `React.memo` to `ProductCard` and other list items. Use `useMemo` for derived values in cart/wishlist contexts (`itemCount`, `total`, `isInWishlist`).
7. **Lighthouse baseline**:
   - Document a manual run procedure in `README.md` ("Run `npm run build && npm run preview`, open `/`, run Lighthouse mobile, record scores").
   - Target: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 on the home page in mobile profile. Document the actual scores you observed.
8. **Misc**:
   - Replace any `setInterval` autoplay carousels (testimonials, brand story) with `requestAnimationFrame`‑based progress to be friendlier on battery.
   - Confirm `prefers-reduced-motion` is honored everywhere Framer Motion animates entrance reveals or parallax.

## Acceptance criteria
- [ ] Routes are lazily loaded with appropriate Suspense fallbacks.
- [ ] Hero image is preloaded; non‑critical images use `loading="lazy"`.
- [ ] Bundle analyzer runs via `npm run analyze` and the storefront bundle does not include admin‑only deps (`recharts`, `@mui/x-data-grid`).
- [ ] Lighthouse mobile shows Performance ≥ 90 on `/` after build.
- [ ] Reduced‑motion preference disables all entrance animations and autoplaying carousels.
- [ ] No new TypeScript files; no inline hex.

## Suggested commit message
`perf(web): lazy routes, preload hero, lazy images, bundle audit, motion polish`
