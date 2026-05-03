# Prompt 29 — Address book

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
Build the address book at `/account/addresses`. Users can add, edit, set default, and delete addresses. The same `AddressForm` is reused at checkout (Prompt 32) so design it as a reusable component now.

## Tasks
1. Create `src/features/account/pages/AddressesPage.jsx`:
   - Lists addresses as `AddressCard` items in a 2‑column grid (`md+`), single column elsewhere.
   - "Add address" brass button at the top‑right of the header row.
   - Empty state: `<EmptyState>` with title "No saved addresses yet.", CTA "Add your first address".
2. `AddressCard.jsx`:
   - Header row: label (e.g. "Home"), default chip (brass soft) when applicable.
   - Body: name, line1/line2, city, emirate, country, phone.
   - Actions: `Edit` (ghost), `Set as default` (ghost, hidden when already default), `Delete` (danger ghost).
   - Edit opens an `AppDialog` with `<AddressForm>` prefilled.
   - Delete opens a confirm dialog with the address summary; on confirm, calls `addressService.remove(id)`. Cannot delete the last remaining default address — show inline error "Add another address before removing your default."
3. `AddressForm.jsx` (reusable):
   - Fields (RHF + yup):
     - `label` (required, e.g. "Home", "Office").
     - `firstName`, `lastName` (required).
     - `phone` (required, valid international, default UAE country code).
     - `line1` (required), `line2` (optional).
     - `city` (required).
     - `emirate` (`AppSelect`, required, options: Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah).
     - `country` (`AppSelect`, default `AE` United Arab Emirates, others disabled).
     - `isDefault` (checkbox).
   - Submit prop `onSubmit(values)` → caller wires to `addressService.create / update`.
   - Cancel prop `onCancel()`.
   - Maps server `errors` to RHF fields on 422.
4. Default exclusivity:
   - When toggling `isDefault: true` on an address (via card action or inside the form), call `addressService.setDefault(id)`. The service ensures only one address is default; the page refetches to update chips.
5. Optimistic UI:
   - Add/Edit/Delete actions update the local list immediately and revert on error with a toast.
6. Section header descriptor: "These addresses appear during checkout."
7. SEO: `<Seo title="Addresses | THIS Interiors" noindex />`.

## Visual / UX spec
- AddressCard surface background, 1px line border, padding 20px.
- Default chip uses brass soft variant, small.
- Delete action uses error palette but kept ghost — a quiet confirmation dialog handles the gravity.
- Form dialog max width 560px; on mobile becomes full‑screen sheet.

## Acceptance criteria
- [ ] List, add, edit, set‑default, and delete all work via the service layer.
- [ ] AddressForm is fully self‑contained with yup validation and server‑error mapping.
- [ ] Cannot delete the last default address; surfaces a clear inline error.
- [ ] Default toggle results in only one default across the list.
- [ ] Empty state shows when there are no addresses.
- [ ] AddressForm exports cleanly so checkout (Prompt 32) can reuse it.

## Suggested commit message
`feat(account): add address book with reusable AddressForm and default exclusivity`
