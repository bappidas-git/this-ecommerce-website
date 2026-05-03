# Prompt 40 — Admin login

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
Build the admin login at `/admin/login` — visually distinct from storefront login, with a deep emerald split layout, soft brute‑force protection (5 attempts → 60 s cooldown), and post‑login redirect to `/admin` (or the previously requested admin path).

## Tasks
1. Create `src/admin/pages/AdminLoginPage.jsx` mounted at `/admin/login`:
   - Standalone page (not wrapped in `AdminLayout`).
   - Two‑column split:
     - Left (60% on `md+`): emerald (`#1F4034`) panel with editorial quote in cream Cormorant 36px and a small wordmark "THIS Interiors — Admin".
     - Right (40% on `md+`): surface panel with the form. Mobile: emerald compresses to a 22vh top band.
2. Form (RHF + yup):
   - `email` (required, valid email).
   - `password` (required, min 1).
   - Submit button: brass primary, full width, 56px, label "Sign in to admin".
3. Soft brute‑force protection:
   - Track failed attempts in `sessionStorage` under `ti_admin_login_attempts`.
   - On 5 consecutive failures, lock the form for 60s. Show a calm "Too many attempts. Try again in 0:42." countdown that updates every second. The lock survives reload.
   - On successful login, clear the counter.
4. Redirect handling:
   - On mount, parse `?redirect=...` (must start with `/admin`); default `/admin`.
   - On success, navigate via `replace: true` to `redirect`.
5. Visual cues:
   - Above the form, a small emerald chip "Admin area".
   - Below the form, a slim row: "Forgot your password? Contact a system admin." (no public reset for admins).
   - Footer: "Encrypted connection · v{appVersion}" (read `VITE_APP_VERSION` from env, default empty).
6. Accessibility:
   - Form labels visible; errors associated via `aria-describedby`; first invalid field receives focus on submit failure.
   - Lockout message uses `aria-live="polite"` so screen readers announce countdowns.
7. SEO: `<Seo title="Admin sign in" noindex />`. Robots disallowed already via `robots.txt`.

## Visual / UX spec
- Right panel padding 64px desktop / 24px mobile.
- Emerald panel shows a faint brass divider line below the wordmark.
- Form max width 380px.
- Numerals (countdown) use `var(--font-mono)`.

## Acceptance criteria
- [ ] `/admin/login` renders the split layout with emerald left and surface right.
- [ ] Submitting valid credentials sets `ti_admin_token` and redirects to `/admin` or the requested admin path.
- [ ] Invalid attempts increment the counter; 5 failures lock for 60s; lock survives reload.
- [ ] Storefront token is unaffected by admin login/logout.
- [ ] Page is not wrapped in `AdminLayout`.

## Suggested commit message
`feat(admin): add admin login with split layout and soft brute-force lock`
