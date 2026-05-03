# Prompt 54 — Admin users and roles

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
Build the admin users area at `/admin/users` (admin role only): a list of admin users, an invite dialog, edit/disable/delete actions with cooldowns, and a roles reference panel. Sidebar items become role‑gated using `useCanAdminAccess`.

## Tasks
1. Create `src/admin/pages/users/UsersPage.jsx` (gated `<RequireAdmin area="users" />`):
   - Breadcrumbs `[{label:'Site'}, {label:'Users'}]`.
   - `<AdminPageHeader>` title "Admin users", description "Invite teammates and assign roles.", actions: "Invite admin" (brass).
2. List rendered as a DataGrid with columns: avatar, name (link → small detail drawer or inline edit), email, role (chip), status (Active / Invited / Disabled), lastLoginAt, row actions (Edit, Disable/Enable, Delete).
3. **Invite dialog** (`InviteAdminDialog.jsx`):
   - Fields (RHF + yup): name (required), email (required, valid), role (`admin | manager | viewer`).
   - Submit calls `adminUserService.invite(payload)` (mocked: creates a user with status `Invited` and a temporary password). Toast shows the temp credentials in dev only (with a "Copy" button); production builds hide the temp password and instruct the inviter to share via secure channel.
4. **Edit dialog** (or inline panel): name, email (read‑only after creation), role.
5. **Disable / Enable**: toggles `isDisabled`. Disabled users cannot log into admin.
6. **Delete with cooldown**:
   - Confirm dialog requires the typed email match (like the customer danger zone in Prompt 28) and a 5s countdown.
   - Cannot delete or disable the **last remaining admin** — surface inline error.
7. **Roles reference panel** (right column, sticky on `lg+`):
   - Card listing the role permission matrix from `useCanAdminAccess`'s spec for quick reference.
   - Eyebrow "ROLES" + small table mapping each role to allowed areas and write capability.
8. Sidebar gating:
   - Verify the admin sidebar already hides items for which `canRead` is false.
   - Add a fallback message inside any admin page that renders for an unauthorized role: "Your role doesn't have access to this area. Ask an admin for permission." (RequireAdmin already covers this — confirm.)
9. Helmet: `<Seo title="Admin users | Admin" noindex />`.

## Visual / UX spec
- Role chips: admin emerald, manager brass, viewer muted.
- Status chips: Active success, Invited warning, Disabled error.
- Roles reference uses mono numerals where applicable; brass underline beneath header.

## Acceptance criteria
- [ ] Only `admin` role can access `/admin/users`. Sidebar hides the item for other roles.
- [ ] Invite, edit, disable/enable, delete flows work via service layer.
- [ ] Last admin cannot be deleted/disabled.
- [ ] Delete requires email match + 5s cooldown.
- [ ] Sidebar role‑gating (Prompt 41) works as documented for all three roles.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add admin users management with roles, invite, disable/delete cooldown`
