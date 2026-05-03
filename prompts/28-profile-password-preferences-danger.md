# Prompt 28 — Profile, change password, preferences, danger zone

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
Build the four account settings pages: Profile (personal info), Password (change), Preferences (communication + theme), and Danger zone (account deletion with cooldown).

## Tasks
1. **Profile page** at `/account/profile` (`src/features/account/pages/ProfilePage.jsx`):
   - Fields (RHF + yup): `firstName`, `lastName`, `email` (disabled, "Contact support to change"), `phone` (optional, valid international), `dateOfBirth` (optional, MUI `DatePicker`).
   - "Save changes" brass button. While submitting: spinner + disabled.
   - Optimistic update via `auth.updateUser(patch)` after API success.
   - On 422, map `errors.*` to RHF `setError` and `setFocus` first invalid.
   - Success toast: "Profile updated."
   - Avatar block on the right (read‑only): placehold.co avatar with initials, name, role pill.
2. **Password page** at `/account/password`:
   - Fields: `currentPassword`, `newPassword`, `confirmPassword`. Yup rules same as register; `confirmPassword` must match.
   - Reuse `<PasswordStrengthMeter />` under `newPassword`.
   - Submit calls `authService.updatePassword({ currentPassword, newPassword })` (add this method to `authService.js` and an endpoint mapping `/auth/password`).
   - On success, toast "Password updated. You'll stay signed in." Reset the form. Optionally rotate token if backend returns a new one.
3. **Preferences page** at `/account/preferences`:
   - Sections:
     - **Communications**: checkboxes for newsletter, restock alerts, sale alerts, order updates (always required, disabled true).
     - **Display**: language (English only, disabled "More languages coming"), currency (AED only, disabled). These are intentionally non‑interactive — keep them visible to set expectation.
   - Save calls `authService.updatePreferences(prefs)` (add method + endpoint `/auth/preferences`). Optimistic.
4. **Danger zone** at the bottom of the Profile page (separated by a divider, eyebrow "DANGER ZONE" in error tone):
   - "Delete my account" button, error palette, ghost variant.
   - On click, opens `<AppDialog>`:
     - Asks the user to type their email address verbatim to confirm.
     - Two‑step cooldown: a 5‑second countdown disables "Delete account" before it becomes clickable.
     - On confirm, call `authService.deleteAccount()` (add method + endpoint). On success, log out, navigate to `/`, queue a brand toast "Your account has been removed."
5. **Form patterns**:
   - All four pages use a shared `<SettingsCard>` wrapper (create under `src/features/account/components/SettingsCard.jsx`) with title, description, content slot, sticky save bar at the bottom showing "Unsaved changes" pill (rose) when `isDirty` and "Saved" when `isSubmitSuccessful`.

## Visual / UX spec
- Form layouts use 2 columns at `md+` for paired fields.
- Save bar is sticky to the bottom of the content card on mobile.
- Danger zone uses a 1px error color top border and small error icon.

## Acceptance criteria
- [ ] All four pages exist at the specified routes.
- [ ] Profile/Preferences/Password forms validate, submit via service layer, toast on success, and map server errors to fields.
- [ ] Password strength meter renders under the new password field.
- [ ] Danger zone confirmation requires email‑typed match and 5s cooldown.
- [ ] Successful account deletion logs out, navigates home, and queues a brand toast.
- [ ] No axios in components; all calls via `authService`.

## Suggested commit message
`feat(account): add profile, password, preferences pages, and danger zone`
