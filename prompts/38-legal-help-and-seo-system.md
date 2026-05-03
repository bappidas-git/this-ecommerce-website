# Prompt 38 — Legal/help pages and the SEO system

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
Build the legal/help pages (FAQ, Privacy, Terms, Shipping & Returns) and centralize the site‑wide SEO system: a `<Seo>` component, an Organization JSON‑LD on every page, and a build‑time `sitemap.xml`.

## Tasks
1. **FAQ page** at `/faq`:
   - Editorial header with eyebrow "Help" + Cormorant title.
   - Sectioned `<Accordion>` groups: Orders, Delivery, Returns, Care, Account, Press. Each group has 4–6 Q&A items with realistic placeholder answers.
   - Search input at top filters questions live (case‑insensitive, debounced 200ms). Highlights matching text in brass.
   - Anchor links per group via slugified ids and a left‑side sticky TOC on `lg+`.
2. **Privacy page** at `/privacy`:
   - Long‑form, but well‑typed: Cormorant section headings, Inter body, max prose width 72ch.
   - Sections: Introduction, Data we collect, How we use it, Sharing, Cookies, Your rights, Contact.
   - Last‑updated date pulled from settings (`settings.legal.privacyUpdatedAt`).
3. **Terms page** at `/terms`:
   - Same layout pattern with sections: Acceptance, Account, Pricing & payment, Orders & cancellation, Returns, Intellectual property, Limitation of liability, Governing law (UAE), Contact.
4. **Shipping & Returns page** at `/shipping-returns`:
   - Sections: Delivery within UAE, Delivery times, Free shipping threshold (AED 500), Returns window (14 days), Damaged in transit, Refund timing.
   - Two simple cards at the top: "Free local delivery on AED 500+" and "Hassle‑free 14‑day returns".
5. **`<Seo>` component** at `src/components/common/Seo.jsx`:
   - Props: `title` (required), `description`, `canonical` (path or absolute URL), `image` (OG/Twitter), `noindex` (boolean), `jsonLd` (object | array of objects), `type` (default `'website'`, can be `'article'`, `'product'`, etc.).
   - Renders Helmet tags: `<title>`, `<meta name="description">`, canonical link, OG (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), Twitter Card (`twitter:card="summary_large_image"`), and JSON‑LD `<script type="application/ld+json">`.
   - Default canonical resolves from `useLocation().pathname` joined with `import.meta.env.VITE_SITE_URL` (add `VITE_SITE_URL=https://shop.thisinteriors.com` to `.env.example`).
6. **Site‑wide Organization JSON‑LD**:
   - Inject once in `MainLayout` via `<Seo jsonLd={organizationJsonLd}/>` (or a sibling Helmet block) so every page emits Organization schema (name, url, logo, sameAs socials, address from settings).
7. **`sitemap.xml`** — build‑time generator:
   - Add `scripts/generate-sitemap.mjs` that reads `db.json` to enumerate categories and products and writes `public/sitemap.xml` with all storefront routes.
   - Add `npm run sitemap` script and run it as part of `prebuild` hook in `package.json`.
   - Sitemap excludes `/admin`, `/checkout`, `/account`, `/cart`, `/wishlist`, `/order/*`, auth routes, and `/_kitchen-sink`.
   - Add `public/robots.txt` allowing all except those excluded paths and pointing to the sitemap.
8. Audit pass: replace any ad‑hoc `<Helmet>` usage with `<Seo>`.

## Visual / UX spec
- Long‑form pages: prose width 72ch, line height 1.6, paragraph spacing 1.25em, heading rhythm 2.5em top / 0.5em bottom.
- FAQ: brass underline on accordion expand; smooth height transition 220ms.

## Acceptance criteria
- [ ] FAQ, Privacy, Terms, Shipping & Returns pages exist and render at the documented routes.
- [ ] FAQ live search filters and highlights match.
- [ ] `<Seo>` component is used on every page and renders all required tags.
- [ ] Organization JSON‑LD is present on every storefront page.
- [ ] `npm run build` produces `dist/sitemap.xml` and `dist/robots.txt`; sitemap excludes admin/checkout/account/auth.

## Suggested commit message
`feat(seo): add legal/help pages, <Seo>, Organization JSON-LD, and sitemap generator`
