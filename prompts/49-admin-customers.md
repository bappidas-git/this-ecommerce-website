# Prompt 49 — Admin customers

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
Build the admin customers area: a list at `/admin/customers` and a detail at `/admin/customers/:id` with tabs (Orders, Addresses read‑only, Reviews, Notes). Notes are admin‑only and never shown to customers.

## Tasks
1. Create `src/admin/pages/customers/CustomersListPage.jsx`:
   - Breadcrumbs `[{label:'People'}, {label:'Customers'}]`.
   - `<AdminPageHeader>` title "Customers", description, actions: "Export CSV" (ghost).
   - Filter row: search (name/email), `Has orders` toggle, `Newsletter subscribers` toggle, sort select (Newest / Top spenders / Most orders).
   - DataGrid columns: avatar (placehold.co), name (link → detail), email, joined date, orders count, lifetime value (mono), last seen, row action menu (View, Email).
2. Create `src/admin/pages/customers/CustomerDetailPage.jsx` at `/admin/customers/:id`:
   - Loads via `adminCustomerService.getById(id)`.
   - Breadcrumbs include name.
   - Hero block: avatar, name, email, joined date, role pill (`Customer`), small action row (`Send password reset`, `Disable account`).
   - Stat row cards: Lifetime value, Orders count, AOV, Last order date.
   - Tabs:
     - **Orders**: DataGrid mirroring the orders list but filtered by user.
     - **Addresses**: Read‑only list of `AddressCard` items (no edit/delete — that's the customer's domain).
     - **Reviews**: List of the customer's reviews with status pills.
     - **Notes**: Admin‑only notes timeline; composer at top (textarea, max 800). Each note has author, timestamp. Calls `adminCustomerService.addNote(id, payload)`.
3. Customer actions:
   - `Send password reset`: triggers `adminCustomerService.sendPasswordReset(id)` (mocked) and toasts confirmation.
   - `Disable account`: opens confirm dialog. Calls `adminCustomerService.disable(id)` which sets a `disabled` flag.
4. Permissions:
   - `viewer` can read everything but cannot add notes, send resets, or disable accounts. Composer/buttons hidden.
   - `manager` and `admin` can perform all actions.
5. Empty / error / loading states standardized.
6. Helmet: list `Customers | Admin`, detail `{name} | Customers | Admin`.

## Visual / UX spec
- Customer hero: avatar 64×64, name Cormorant 28px, email muted.
- Stat cards: 2x2 on `md`, 4x1 on `lg+`.
- Tabs: brass underline indicator on active tab.
- Notes timeline mirrors the order detail timeline visual style.

## Acceptance criteria
- [ ] List filters/sorts/paginates via URL state.
- [ ] Detail page renders hero + stats + tabs and switches without reloading.
- [ ] Notes are admin‑only (clearly labeled) and persist via service.
- [ ] Address tab is read‑only (no Edit/Delete actions).
- [ ] Permissions enforced for write actions.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add customers list and detail with tabs (orders, addresses, reviews, notes)`
