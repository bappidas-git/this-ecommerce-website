# Prompt 37 — About and Contact

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
Build the editorial About page and the Contact page. Both pages set the brand tone for new visitors, and Contact provides a working enquiry form with map embed and quiet, useful microcopy.

## Tasks
1. **About page** at `/about` (`src/features/static/pages/AboutPage.jsx`):
   - Hero band: full‑width image (placehold.co `1F4034` editorial), Cormorant headline "Designed in Dubai. Made to outlast trends.", short kicker.
   - Story section: two columns at `md+` (image left, prose right) telling a short brand story (3–4 paragraphs of placeholder copy).
   - Pillars strip: 3 cards on `md+`: "Considered design", "Hand‑finished craft", "Local atelier". Each card with a small number, title, kicker.
   - Counters strip (emerald section): 4 metrics with Cormorant numbers — "12 years of craft", "1,800+ pieces shipped", "8 collaborators", "1 city". Animate counters from 0 to value over 1.4s once `whileInView`.
   - Press logos: 5 placehold.co `Press` style logos in a quiet grid.
   - CTA strip: brass "Visit the atelier" button → `/contact`.
   - Each section uses `<Section>` with appropriate tones. Subtle Framer Motion `whileInView` reveals.
2. **Contact page** at `/contact` (`src/features/static/pages/ContactPage.jsx`):
   - Two columns at `md+`:
     - Left: contact info card with address (from settings.general.address), phone (clickable `tel:`), email (clickable `mailto:`), opening hours, and a Google Maps `<iframe>` embed (use a placeholder URL pointing to Dubai coordinates; document that the URL is configurable in settings — `settings.general.mapEmbedUrl`).
     - Right: enquiry form (RHF + yup):
       - `name` (required), `email` (required, valid email), `subject` (`AppSelect`: General, Order help, Press, Trade), `orderNumber` (optional, prefilled from `?orderNumber=` query), `message` (required, 10–1000 chars), `acceptsContact` (required true).
       - Submit calls `contactService.send(payload)` (add `src/api/services/contactService.js` with a `POST /contact` endpoint mocked in `server/server.js` to log the message and return `{ data: { ok: true } }`).
       - On success, replace the form with a confirmation card "Message received. We'll reply within 1–2 business days." with a "Send another" link to reset the form.
   - Below: small FAQ rail of 3 collapsed `Accordion` items linking to `/faq` for the full list.
3. SEO:
   - About: title "About THIS Interiors", description, OG image.
   - Contact: title "Contact | THIS Interiors", description, OG image.
   - Both: include `Organization` JSON‑LD on About using settings (Prompt 38 will hoist a global Organization JSON‑LD).
4. Microcopy guidelines:
   - Quiet, considered phrasing. Avoid "Get in touch!" — use "Write to the studio.".
   - Privacy nudges below contact fields ("We only use this to reply to you.").

## Visual / UX spec
- About hero: 70vh on `md+`, 50vh mobile.
- Counters: Cormorant 64px ink (or cream on emerald section).
- Contact info card: surface background, line border, padding 24px.

## Acceptance criteria
- [ ] `/about` and `/contact` render with all sections and brand tone.
- [ ] About counters animate once when in view; respect reduced motion.
- [ ] Contact form validates, submits via service layer, and shows the confirmation state on success.
- [ ] Map embed loads from a configurable URL.
- [ ] Both pages include Helmet meta and JSON‑LD.

## Suggested commit message
`feat(static): add editorial About page and Contact page with form and map`
