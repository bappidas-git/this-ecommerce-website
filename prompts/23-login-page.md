# Prompt 23 — Login page

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
Build the customer login page. Editorial split layout: left side shows a calm photographic placeholder; right side hosts the form. Uses RHF + yup, supports `?redirect=` to return to a protected route, and toasts on success.

## Tasks
1. Create `src/features/auth/components/AuthShell.jsx` and CSS module — the shared layout used by login/register/forgot/reset:
   - Two columns at `md+`: left 50% editorial image (placehold.co `1F4034` hero), right 50% form panel on cream.
   - Mobile: image collapses to a top band 24vh tall.
   - Top‑left corner of the form panel: small wordmark logo linking home.
   - Footer note: "Designed in Dubai • English" (small, muted).
   - Use Framer Motion to fade in the form column once on mount (16px, 320ms).
2. Create `src/features/auth/pages/LoginPage.jsx`:
   - Eyebrow "Welcome back", Cormorant title "Sign in".
   - Form (RHF + yup):
     - `email` — required, email.
     - `password` — required, min 1.
     - `remember` — checkbox, default true.
   - Submit button: brass, full width, 56px, "Sign in", `loading` while submitting.
   - Inline server error rendered as a calm `<Alert severity="error">` above the form when login fails.
   - Below the form:
     - "Forgot your password?" → `/forgot-password`.
     - "New here? Create an account" → `/register`.
3. Redirect handling:
   - On mount, parse `?redirect=...` from URL.
   - On successful login, navigate to that path (default `/`). If `redirect` starts with `/admin`, ignore it (storefront login should never redirect into admin) and go to `/account/profile`.
4. Validation copy guidelines:
   - Empty email → "Please enter your email."
   - Invalid email → "That email doesn't look right."
   - Empty password → "Please enter your password."
5. Pre‑fill email from `?email=` param when present (e.g. coming from a subscription link).
6. Accessibility:
   - Form field labels visible (no placeholder‑only labels).
   - Inline errors associated via `aria-describedby`.
   - Focus moves to the first invalid field on submit error (`useEffect` + `setFocus` from RHF).
7. SEO: `<Seo title="Sign in | THIS Interiors" noindex />`.

## Visual / UX spec
- Form panel padding `48px` desktop, `24px` mobile. Max width 420px.
- Inputs: 56px tall, brass focus border, helper text 12px muted.
- Buttons: full width on mobile, 320px on desktop.
- Subtle 1px brass divider beneath section titles.

## Acceptance criteria
- [ ] `/login` renders the editorial split layout (image left, form right at `md+`).
- [ ] RHF + yup validates all fields with the specified copy.
- [ ] On success, navigates to `redirect` (or default), and toasts "Welcome back, {firstName}".
- [ ] On 401, shows a calm inline error.
- [ ] Storefront login never redirects to `/admin`.
- [ ] Form is fully keyboard‑navigable; first invalid field receives focus.

## Suggested commit message
`feat(auth): add login page with editorial split layout, RHF + yup, redirect support`
