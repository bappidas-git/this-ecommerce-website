# THIS Interiors — Build Prompts

This folder contains a sequential set of focused prompts that, when run in order through Claude Code AI, build the THIS Interiors e‑commerce website and `/admin` panel from an empty repo to a polished, production‑grade frontend with a json‑server mock backend that is swap‑ready for a future Laravel + MySQL backend.

## How to use
1. Open prompt `01-project-init-and-structure.md` and paste its full contents (or feed the file) into Claude Code AI.
2. Let Claude Code AI complete that prompt's deliverable. Verify every acceptance criteria checkbox before moving on.
3. Commit the changes using the suggested commit message at the bottom of each prompt.
4. Move to the next prompt and repeat.

## Tips
- Each prompt is intentionally focused so it fits in one Claude Code AI session without timing out.
- If a session does time out mid‑prompt, start a fresh session and re‑paste the same prompt — every prompt restates the project context at the top so it can run standalone.
- Do not skip prompts. Later prompts assume the work of earlier ones.
- The admin panel is gated behind `/admin/login` and lives at `/admin/*`. There is no link to it from the storefront — open it directly in the browser.

## Tech stack (locked)
React 18 (Vite, JS only — no TypeScript), MUI v5, CSS Modules, Framer Motion, react‑router‑dom v6, react‑hook‑form + yup, axios, json‑server with custom Express middleware. Swap‑ready for Laravel + MySQL via `VITE_API_BASE_URL`.

## Brand identity (locked)
- **Palette:** `#F7F3ED` bg, `#FFFFFF` surface, `#1B1A17` ink, `#4A453E` ink‑2, `#8C8678` muted, `#E5DED2` line, `#B8924F` brass, `#9A7836` brass‑2, `#1F4034` emerald, `#C8A29A` rose, `#B0382A` error, `#3F6B4F` success, `#B8862B` warning.
- **Fonts:** Cormorant Garamond (display), Inter (UI), JetBrains Mono (admin numerals).
- **Radii:** 4 / 8 / 14 / 24 / 999. Soft low‑opacity shadows only.

## Image policy
All placeholder images use `https://placehold.co/{w}x{h}/{bg}/{fg}?text={label}&font=playfair` with brand‑aligned hex codes. Never invent fake CDN URLs (no Unsplash, no Pexels, no random hostnames).

## Index

### Batch 1 — Foundation
01. Project init and structure
02. MUI theme and design tokens
03. Global styles and typography primitives
04. JSON server, db.json, and custom middleware
05. API service layer

### Batch 2 — Routing and layout
06. Routing and app shell
07. Header and mega menu
08. Footer
09. Mobile drawer navigation
10. Common UI primitives

### Batch 3 — Product discovery
11. Canonical ProductCard
12. Home hero and category mosaic
13. Home supporting sections
14. Shop listing layout
15. Shop filtering, sorting, pagination, URL state
16. Product detail page

### Batch 4 — Cart and wishlist
17. Cart context and persistence
18. Mini cart drawer
19. Cart page
20. Wishlist context and page
21. Toast and feedback unification

### Batch 5 — Authentication
22. Auth context and token handling
23. Login page
24. Register page
25. Forgot and reset password
26. Protected route polish

### Batch 6 — User account
27. Account layout
28. Profile, change password, preferences, danger zone
29. Address book
30. My orders list and detail

### Batch 7 — Checkout
31. Checkout layout and stepper
32. Address step
33. Payment step
34. Review, place order, confirmation

### Batch 8 — Reviews, search, static
35. Product reviews
36. Global search
37. About and Contact
38. Legal/help and SEO system

### Batch 9 — Admin foundation
39. Admin app structure
40. Admin login
41. Admin layout
42. Admin dashboard

### Batch 10 — Admin catalog
43. Admin products list
44. Admin product add/edit form
45. Admin categories
46. Admin inventory

### Batch 11 — Admin orders, customers, reviews, coupons
47. Admin orders list
48. Admin order detail
49. Admin customers
50. Admin reviews moderation
51. Admin coupons

### Batch 12 — Admin settings, reports, users
52. Admin site settings
53. Admin reports
54. Admin users and roles

### Batch 13 — Polish and handoff
55. Form validation conventions
56. Error boundary, crash, server error, offline
57. Skeletons and optimistic UI
58. Performance pass
59. Responsive QA pass
60. README and Laravel handoff doc
