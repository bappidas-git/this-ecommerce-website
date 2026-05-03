# Prompt 55 — Form validation conventions

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
Standardize form patterns across the codebase: extract shared yup validators, standardize how every form maps server errors to fields, and enforce `setFocus` on the first invalid field. Audit existing forms and refactor them to comply.

## Tasks
1. Create `src/utils/validators.js` exporting reusable yup schemas:
   - `emailField`, `passwordField` (8+ chars, lowercase, uppercase, number), `nameField`, `phoneField` (international with libphonenumber‑style permissive regex), `urlField`, `slugField`, `priceField` (≥ 0), `quantityField` (integer ≥ 0), `addressFieldsObject`, `creditCardFieldsObject`, `couponCodeField`.
   - Each rule includes consistent, on‑brand error copy (no exclamation marks; calm phrasing).
2. Create `src/hooks/useApiFormError.js`:
   - Signature: `useApiFormError(formMethods)` returns `(error) => void`.
   - For a normalized API error `{ message, errors, status }`, walks `errors` and calls `setError(field, { message })` for each. If there are field errors but no top‑level message, scrolls the first invalid field into view via `setFocus`. If only `message` (no field errors), surfaces it via the `useToast()` `error` channel.
3. Create `src/hooks/useFocusFirstInvalid.js`:
   - Subscribes to RHF `formState.submitCount` changes; on submit failure, calls `setFocus(firstErrorKey)`.
4. Audit pass — refactor every form in the codebase:
   - Storefront: login, register, forgot, reset, profile, password, preferences, address book, address & payment steps in checkout, contact form, newsletter forms, write‑review form, coupon input.
   - Admin: product form, category editor, coupon dialog, order status note dialog, order refund dialog, user invite dialog, settings tabs.
   - For each form:
     1. Replace ad‑hoc yup schemas with the shared validators where possible.
     2. Wrap submit `try/catch` to use `useApiFormError(formMethods)` for failures.
     3. Add `useFocusFirstInvalid(formMethods)`.
     4. Confirm "(optional)" tags appear via `<AppTextField optional />` for non‑required fields.
5. Document the pattern briefly in `src/utils/validators.js` header comment so future contributors follow it.

## Acceptance criteria
- [ ] `src/utils/validators.js` is the single source for shared yup validators.
- [ ] `useApiFormError` is used in every form's submit catch block to map server errors to fields.
- [ ] First invalid field receives focus on submit failure across every form.
- [ ] Optional fields display "(optional)" consistently.
- [ ] Error copy is calm, on‑brand, and consistent (no exclamation marks).
- [ ] No regressions: every form still submits, validates, and surfaces errors as before.

## Suggested commit message
`refactor(forms): extract shared validators, unify server-error mapping, focus-first-invalid`
