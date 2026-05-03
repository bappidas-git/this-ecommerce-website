# Prompt 03 — Global styles and typography primitives

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
Build the editorial typography and layout primitives that every storefront page will compose: `Section`, `Container`, `Eyebrow`, `SectionHeader`, `PriceTag`. Extend the utilities module. These are tiny, reusable, and brand‑defining — every later screen depends on them.

## Tasks
1. Create `src/components/common/Section.jsx` and `Section.module.css`:
   - Renders a `<section>` with vertical padding (mobile 48px, ≥md 96px).
   - Props: `tone` (`'cream' | 'surface' | 'emerald' | 'ink'`, default `'cream'`), `dense` (boolean → reduces vertical padding by 33%), `as`, `id`, `className`, `children`, `aria-labelledby`.
   - `tone='emerald'` → background emerald, default text bg/cream; `tone='ink'` → background ink, text bg.
2. Create `src/components/common/Container.jsx` thin wrapper around MUI `Container` with default `maxWidth="lg"` and a `gutter` prop that adds `px: { xs: 2, md: 4 }`.
3. Create `src/components/common/Eyebrow.jsx` and `Eyebrow.module.css`:
   - Small uppercase label, Inter, weight 500, letter‑spacing 0.18em, font‑size 12px, color muted by default.
   - Props: `color` (`'muted' | 'brass' | 'emerald' | 'bg'`), `as` (default `span`), `children`.
4. Create `src/components/common/SectionHeader.jsx` and `SectionHeader.module.css`:
   - Three slots: optional `<Eyebrow>`, a display headline (`h2` Cormorant 32–48px responsive), and an optional kicker paragraph (Inter 16–18px ink2, max 56ch).
   - Props: `eyebrow`, `title`, `kicker`, `align` (`'left' | 'center'`, default `left`), `tone` (passes through to Eyebrow + headline color for emerald/ink sections), `cta` (optional ReactNode rendered right side on ≥md when `align='left'`).
   - Use Framer Motion `whileInView` for a 12px fade‑up entrance with `once: true` and `viewport: { amount: 0.4 }`.
5. Create `src/components/common/PriceTag.jsx` and `PriceTag.module.css`:
   - Renders a price (currency from `import.meta.env.VITE_DEFAULT_CURRENCY`, default `AED`).
   - Props: `value` (number), `compareAt` (optional number), `size` (`'sm' | 'md' | 'lg'`).
   - When `compareAt > value`, render the strike‑through compareAt (muted) followed by the active price (ink), and a small "Save X%" chip in brass.
   - Format with `Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 })`.
6. Extend `src/styles/utilities.module.css` with:
   - `.srOnly` (already), `.flexCenter`, `.stack`, `.row`, `.divider` (1px line, full width), `.editorialRule` (60px gold underline used under headings), `.fadeIn` (animation 320ms ease‑out from 0 to 1).
7. Create `src/utils/format.js` exporting `formatCurrency(value, currency)`, `formatNumber(value)`, `formatDate(date, pattern)` (uses `date-fns/format`), and `truncate(str, n)`.
8. Add a developer preview route `/_kitchen-sink` (only when `import.meta.env.DEV`) that renders one of every primitive at three sizes — useful for visual QA. Add the route in `App.jsx` temporarily; later prompts will move dev routes into a single dev module.

## Visual / UX spec
- Eyebrow color defaults to muted; on emerald/ink tones use brass.
- SectionHeader applies a 60px brass underline directly under the headline (use `.editorialRule`) when on cream/surface tones.
- PriceTag size `lg` is 24px ink, weight 500.

## Acceptance criteria
- [ ] All five primitives exist with the documented props.
- [ ] `Section` correctly applies tone backgrounds and inverts text on emerald/ink.
- [ ] `Eyebrow` renders uppercase with the right tracking and color.
- [ ] `SectionHeader` reveals on scroll once via Framer Motion (no looping).
- [ ] `PriceTag` formats AED and shows save % when applicable.
- [ ] `/_kitchen-sink` shows all primitives in dev only.

## Suggested commit message
`feat(ui): add editorial typography & layout primitives (Section, Container, Eyebrow, SectionHeader, PriceTag)`
