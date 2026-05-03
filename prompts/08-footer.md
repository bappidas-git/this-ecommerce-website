# Prompt 08 — Footer

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
Ship the storefront footer: a five‑column editorial layout with a newsletter sign‑up, secondary nav, contact info, social, payment icons, and a slim legal strip. Looks gallery‑grade at all viewports.

## Tasks
1. Create `src/components/layout/Footer/Footer.jsx` and `Footer.module.css`:
   - Section uses `tone="ink"` (deep ink background, cream text).
   - Top band: 5‑column grid on `md+`, accordion stack on mobile.
     - **Brand column**: wordmark logo (cream), short brand statement (3 lines), Dubai address from settings.
     - **Shop**: New, Bestsellers, Vases, Lamps, Mirrors, All categories.
     - **Account**: Sign in, Create account, Wishlist, My orders, Address book.
     - **Help**: Contact, Shipping & Returns, FAQ, Privacy, Terms.
     - **Newsletter**: Eyebrow "Letters from the studio", short kicker, `NewsletterForm`.
   - Bottom band: copyright, "Designed in Dubai", payment icons (Visa, Mastercard, Amex, Apple Pay, COD badge — placehold.co `Press` style logos), social icons (Instagram, Pinterest, TikTok, Facebook).
2. Create `Footer/NewsletterForm.jsx`:
   - RHF + yup. Single email field with brass submit ("Subscribe").
   - On submit, call `authService.subscribe?` (placeholder) — for now, just simulate success and toast "Thank you — confirmation in your inbox shortly." via the toast helper (Prompt 21 unifies this; for now, an inline `useNotistack` snackbar is fine).
   - Honor `aria-describedby` for inline error messages.
3. Create `Footer/SocialIcons.jsx`:
   - Renders icons with `aria-label`. Reads social URLs from `useSettings()` placeholder.
4. Create `Footer/PaymentIcons.jsx`:
   - Renders 5 small placeholder badges using the `Press` style placehold.co URL with white background and ink text (`https://placehold.co/56x32/FFFFFF/1B1A17?text=VISA`).
5. Mobile accordions: only the four navigation columns collapse to `<details>` elements; brand and newsletter remain always visible.
6. Wire `Footer` into `MainLayout`. Confirm it appears on every storefront page.
7. Use Framer Motion `whileInView` for a subtle 12px fade‑up on the brand column only (not on the link grid).

## Visual / UX spec
- Vertical padding 96px desktop / 56px mobile. Internal column gap 32px.
- Cream text on ink, brass for hover on links, divider line `--color-line` at 12% opacity.
- Newsletter input: outlined with subtle cream border, brass focus, 56px tall.
- Payment icon row right‑aligned on desktop, centered on mobile.

## Acceptance criteria
- [ ] Footer renders on every storefront page; not present on admin or checkout layouts.
- [ ] Five columns on `md+`, accordions on `xs–sm` for the four nav columns.
- [ ] Newsletter form validates email, shows success snack on submit.
- [ ] All social and payment icons use `aria-label` and `alt` text.
- [ ] No inline hex; uses `theme.palette` and CSS variables only.

## Suggested commit message
`feat(layout): add editorial footer with newsletter, social, payment, legal strip`
