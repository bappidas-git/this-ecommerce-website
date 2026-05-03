# Prompt 52 — Admin site settings

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
Build site settings at `/admin/settings`: tabs for General, Branding, Homepage, Announcement, Payment, Social, Emails. Storefront reflects updates via the public `useSettings()` hook (already used since Prompt 7).

## Tasks
1. Create `src/admin/pages/settings/SettingsPage.jsx`:
   - Breadcrumbs `[{label:'Site'}, {label:'Settings'}]`.
   - `<AdminPageHeader>` title "Settings", description, actions: "Save" (sticky in each tab; the button below is duplicate).
   - Tabs with `useSearchParams('tab=...')` URL state:
     - **General** — store name, support email, support phone, currency (locked AED), default language (English), studio address (multiline), opening hours, mapEmbedUrl.
     - **Branding** — logo wordmark text, favicon URL (placehold.co default), accent color (brass — locked but visible), OG default image URL.
     - **Homepage** — heroTitle, heroSubtitle, heroCta, heroImage, featuredCategoryIds (multi‑select), featuredProductIds (multi‑select).
     - **Announcement** — isActive switch, text, link, dismissible switch.
     - **Payment** — switches for `cardEnabled`, `codEnabled`, `bankTransferEnabled`; bankDetails fields (bank name, account name, IBAN). Optional `codFee` numeric.
     - **Social** — instagram, pinterest, facebook, tiktok URLs.
     - **Emails** — placeholder copy fields (welcome, order confirmation, shipped, refund — they are textareas; documented as future templates).
2. Each tab is a single `<form>` (RHF + yup) with its own submit button. On save, calls `adminSettingsService.update(group, payload)` (the mock backend updates the `settings` document at the `group` key).
3. After save, refresh `useSettings()` cache so storefront screens reflect changes immediately. The public `useSettings` hook should subscribe to a small event `ti:settings-updated` dispatched after save and refetch once.
4. Layout:
   - Tabs left (vertical) on `lg+`, top tabs on `md` and below.
   - Right side: form content in `AdminCard` blocks per logical group.
5. Permissions:
   - Only `admin` and `manager` can save; `viewer` sees disabled fields.
6. Validation:
   - `mapEmbedUrl`, `heroImage`, social URLs, etc. validated as URL strings.
   - Email fields validated as emails.
   - Strict yup schemas per tab.
7. Helmet: `<Seo title="Settings | Admin" noindex />`.

## Visual / UX spec
- Each tab's form sits inside `AdminCard` blocks with eyebrow titles.
- Live preview where possible: announcement bar previewer above the form when editing announcement; logo wordmark preview when editing branding.
- "Unsaved changes" pill appears when `isDirty`.

## Acceptance criteria
- [ ] All seven tabs render and persist their fields via the service layer.
- [ ] After save, storefront `useSettings()` refetches and consumers (Header announcement, Hero copy, Footer socials) reflect changes without a reload.
- [ ] Validation prevents invalid URLs/emails and surfaces field‑level errors.
- [ ] Live previews work for announcement and branding.
- [ ] Permissions enforced.
- [ ] No axios in components.

## Suggested commit message
`feat(admin): add settings (general, branding, homepage, announcement, payment, social, emails)`
