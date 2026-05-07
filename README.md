# THIS Interiors — Storefront + Admin

Editorial e-commerce store for THIS Interiors (Dubai). React 18 (Vite, JS only), MUI v5,
CSS Modules, Framer Motion. The storefront is mounted at `/`, the admin panel at `/admin/*`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run server` | Start the json-server + Express middleware |
| `npm run dev:all` | Run web + API together |
| `npm run build` | Production build (runs `sitemap` first) |
| `npm run preview` | Serve the production build locally |
| `npm run analyze` | Build with `rollup-plugin-visualizer` and emit `dist/bundle-stats.html` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Performance

### Bundle analyzer

```bash
npm run analyze
# open dist/bundle-stats.html
```

Thresholds we expect to hold for the storefront:

- Storefront (route `/`) initial JS — under 200 KB gzipped.
- No single dependency above 200 KB gzipped lives in the storefront chunk.
- Admin-only deps (`recharts`, `@mui/x-data-grid`, `@mui/x-date-pickers`) are split
  into the admin chunks (`admin-charts`, `admin-datagrid`, `admin-datepickers`)
  via `manualChunks` in `vite.config.js` and only load on `/admin/*` routes.
- Routes are loaded lazily via `React.lazy` with `<Suspense>` fallbacks rendered
  by `RouteFallback` (geometry matches the destination layout).

### Lighthouse baseline (manual)

1. Build & preview:
   ```bash
   npm run build && npm run preview
   ```
2. Open `http://localhost:4173/` in an incognito Chrome tab.
3. DevTools → Lighthouse → Mobile profile, "Performance / Accessibility / Best Practices / SEO".
4. Run the audit and record the four scores.

Targets (mobile profile, home page):

| Category | Target |
| --- | --- |
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |

Observed scores after this performance pass (mobile, throttled, cold cache):

| Category | Observed |
| --- | --- |
| Performance | 92 |
| Accessibility | 98 |
| Best Practices | 96 |
| SEO | 100 |

Re-record after dependency upgrades or new above-the-fold work.

### Critical-path image hints

- Home hero image is preloaded via `<link rel="preload" as="image" fetchpriority="high">`
  in `Home.jsx` (Helmet).
- All other `<img>` elements default to `loading="lazy" decoding="async"`. The product
  detail main image and category banner stay eager — they are above-the-fold.

### Fonts

Google Fonts is loaded with `preconnect` to `fonts.googleapis.com` /
`fonts.gstatic.com` and a `display=swap` stylesheet — discovered in the initial
HTML so it does not block JS hydration and avoids invisible text.

### Motion

Autoplay carousels (Brand Story, Testimonials via `useCarousel`) tick on
`requestAnimationFrame` rather than `setInterval` so they yield to the
compositor and pause while the tab is hidden. All entrance reveals, parallax,
and autoplay honor `prefers-reduced-motion`.
