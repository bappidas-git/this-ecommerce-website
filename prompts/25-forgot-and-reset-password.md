# Prompt 25 — Forgot and reset password

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
Build the password recovery flow: a request page that submits an email and shows a calm confirmation screen, plus a reset page that accepts a token from the URL and a new password. Both use `<AuthShell>`.

## Tasks
1. Create `src/features/auth/pages/ForgotPasswordPage.jsx` at `/forgot-password`:
   - Eyebrow "Forgot password", Cormorant title "Reset your password".
   - Form (RHF + yup): single `email` field (required, valid email).
   - Submit calls `auth.forgot({ email })`.
   - **Cooldown**: after a successful submit, show a confirmation card (replacing the form) with eyebrow "Check your email", title "We've sent reset instructions to {email}.", small kicker "If you don't see it within a few minutes, check spam or try again." A muted countdown "Resend in 60s" disables a "Resend" button until 60s elapses. The cooldown is stored in `sessionStorage` so a refresh respects it.
   - On API error (e.g., rate‑limited), surface `<Alert severity="error">` above the form.
2. Create `src/features/auth/pages/ResetPasswordPage.jsx` at `/reset-password`:
   - Reads `?token=...` and `?email=...` from URL. If `token` missing, render an `EmptyState` "This link is no longer valid." with CTA "Request a new link" → `/forgot-password`.
   - Form: `password` (same yup rules as register), `confirmPassword` (must match).
   - Reuses `<PasswordStrengthMeter />` from Prompt 24.
   - Submit calls `auth.reset({ token, password })`.
   - On success: navigate to `/login` and queue a polite toast "Your password has been updated. Sign in to continue." Pre‑fill the email param on the login page if available.
   - On 410/422: show inline error if the token expired or rules failed.
3. Banner on Login post‑reset:
   - When the queued toast is consumed, also show a one‑time `<Alert severity="success">` strip above the login form for 8s ("Password updated. Sign in below."). Implement via the `queueToast` mechanism plus a `queueBanner` companion stored under `ti_queued_banner`.
4. Accessibility:
   - Both forms set focus to the first invalid field on error.
   - Confirmation card after forgot has its own `aria-live="polite"` region announcing "Reset link sent to {email}".

## Visual / UX spec
- Confirmation card in `<AuthShell>`: emerald icon (small mail glyph) at the top, eyebrow muted, title Cormorant 28px.
- Cooldown timer is small, muted, monospaced (use `var(--font-mono)`).

## Acceptance criteria
- [ ] `/forgot-password` validates and submits the email; shows the confirmation card on success.
- [ ] Resend button disabled until the 60s cooldown elapses; cooldown survives refresh.
- [ ] `/reset-password` blocks gracefully when token is missing/invalid.
- [ ] Successful reset navigates to login and shows the post‑reset banner once.
- [ ] All copy and routes match the spec exactly.

## Suggested commit message
`feat(auth): add forgot/reset password flow with cooldown and post-reset banner`
