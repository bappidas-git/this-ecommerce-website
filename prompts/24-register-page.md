# Prompt 24 — Register page

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
Build the customer registration page using `<AuthShell>`. Includes a password strength meter, a terms checkbox, and an optional newsletter opt‑in. Auto‑logs in on success.

## Tasks
1. Create `src/features/auth/pages/RegisterPage.jsx`:
   - Eyebrow "Begin your collection", Cormorant title "Create an account".
   - Form fields (RHF + yup):
     - `firstName` (required, 1–50 chars).
     - `lastName` (required, 1–50 chars).
     - `email` (required, valid email).
     - `password` (required, min 8, must contain uppercase, lowercase, number — see strength meter below).
     - `confirmPassword` (must match password).
     - `acceptsTerms` (required true) — "I agree to the Terms and Privacy Policy" with linked routes.
     - `subscribe` (optional, default true) — "Receive letters from the studio".
2. Create `src/features/auth/components/PasswordStrengthMeter.jsx`:
   - Reads RHF watched value.
   - Computes strength (0–4) using checks: length ≥ 8, has lowercase, has uppercase, has number, has symbol (extra). Map score to label `Weak | Fair | Good | Strong`.
   - Renders 4 segment bars (line by default, fills colored: error → warning → brass → success).
   - Render under the password field with the textual label muted.
3. Auto‑login flow:
   - On successful `register`, the auth context auto‑logs the user in and redirects to `/account/profile` (or to `?redirect=`).
   - Show a brand toast: "Welcome to THIS Interiors, {firstName}."
4. Server‑error mapping:
   - On 422, map `errors.email` → field error using RHF `setError('email', { message })`. Same for any other field in the response.
   - Generic `error.message` shown above the form via `<Alert severity="error">` if no field‑specific errors.
5. Privacy hints:
   - Tiny muted helper under email: "We'll never share your email. Read our privacy policy."
   - Tiny muted helper under password: "Use 8+ characters with a number and a capital letter."
6. SEO: `<Seo title="Create an account | THIS Interiors" noindex />`.

## Visual / UX spec
- Form layout: two columns at `md+` for first/last name; single column elsewhere.
- Strength meter beneath the password field, 4 px tall segments, 4px gap, 200 ms color transitions.
- Terms checkbox label uses ink2 with brass underlined links.
- Submit button "Create account", full width, 56px.

## Acceptance criteria
- [ ] `/register` renders via `<AuthShell>` with all fields.
- [ ] Yup enforces all rules including password match and acceptsTerms.
- [ ] Strength meter updates as the password is typed and labels are correct.
- [ ] On 422, field errors map to fields; generic errors render above the form.
- [ ] On success, user is auto‑logged in and redirected; brand toast appears.
- [ ] First invalid field receives focus on submit failure.

## Suggested commit message
`feat(auth): add register page with strength meter, terms, and auto-login`
