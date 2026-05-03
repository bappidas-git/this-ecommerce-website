# Prompt 21 — Toast and feedback unification

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
Centralize all transient feedback. Replace direct `notistack` calls scattered through the codebase with a single `useToast()` hook that exposes brand‑consistent variants and a queued `sessionStorage` toast (used after a redirect). Standardize how the app uses `EmptyState` and `ErrorState`.

## Tasks
1. Create `src/context/ToastContext.jsx`:
   - Wraps `notistack`'s `<SnackbarProvider>` with brand options (max snack 3, anchor `bottom-right` on `md+`, `top-center` on `xs–sm`, autoHide 4s).
   - Exposes `useToast()` returning `{ success, error, info, warning, brand, dismiss }`. Each method takes `(message, options?)`.
   - Variants:
     - `success` — emerald accent, check icon.
     - `error` — error red, alert icon.
     - `info` — ink, info icon.
     - `warning` — warning amber, warning icon.
     - `brand` — brass background, cream text, used for marketing‑adjacent confirmations.
2. Custom `BrandSnackbar.jsx` component used as `Components` override in `notistack` for consistent typography (Inter 14px) and rounded radius `--radius-md`.
3. Queued toast across navigation:
   - Helper `queueToast({ variant, message })` writes to `sessionStorage` under `ti_queued_toast`.
   - On `<ToastProvider>` mount and on every `useLocation` change, drain the queue and emit the toasts. Used by `RequireAuth`, `RequireAdmin`, etc., to show "Please sign in" or "Session expired" after redirects.
4. Refactor pass:
   - Search the codebase for any direct `useSnackbar` / `enqueueSnackbar` usage and replace with `useToast()`.
   - Search for ad‑hoc `<Alert>` placements that should be toasts (form submission feedback after redirect, etc.) and route them through `queueToast`.
5. Standardize `EmptyState` and `ErrorState` usage:
   - Pass through `<ErrorState>` for any failed list load with a retry button (`onRetry={refetch}`).
   - Pass through `<EmptyState>` for "no results" screens (cart, wishlist, search, orders, reviews list) with consistent eyebrow + title + kicker + CTA.
6. Add a tiny `useApiError(error)` helper under `src/hooks/` that turns the normalized API error into a user‑friendly message (`error.message` if present, else "Something went wrong. Please try again."). Use it in catch blocks that show toasts.
7. Wire `<ToastProvider>` once at the very top in `main.jsx` (above `<ThemeProvider>`).

## Acceptance criteria
- [ ] `useToast()` is the only way the app emits transient messages.
- [ ] All toasts share brand styling (font, radius, color tokens).
- [ ] Cross‑navigation toasts (queued in sessionStorage) drain on mount and route change without duplicating.
- [ ] All empty/error screens use `<EmptyState>` and `<ErrorState>`.
- [ ] Snack position adapts to viewport (`bottom-right` desktop, `top-center` mobile).

## Suggested commit message
`feat(ux): unify toasts via useToast and standardize empty/error states`
