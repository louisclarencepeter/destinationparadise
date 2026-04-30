# Destination Paradise

React + Vite rebuild of the Destination Paradise website, ported 1:1 from the
[Claude Design](https://claude.ai/design) handoff (`Homepage.html`). Hosted on Netlify.

## Stack

- Vite + React 18
- React Router 6 (multi-page scaffolding)
- Plain CSS (the design's `styles.css` ported with paths rewritten — no preprocessor)
- Netlify hosting + one Function for the AI Trip Planner
- Netlify Forms for the newsletter (no backend code needed)

## Run

```bash
npm install
npm run dev          # local dev at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the dist/ build
```

For the AI planner to work locally with a real backend, install the Netlify CLI
and run `netlify dev` instead of `npm run dev` — that wires `/api/planner` to
the function.

## Environment variables

Set on the Netlify site (Site settings → Environment):

- `ANTHROPIC_API_KEY` — required for the AI Trip Planner. Without it the planner
  returns a friendly fallback message and points users to WhatsApp.

## Routes

| Route | Page | Status |
| --- | --- | --- |
| `/` | `src/pages/Homepage.jsx` | **1:1 design** — full homepage from `Homepage.html` |
| `/excursions`, `/excursions/:id` | `src/pages/Excursions.jsx` | Placeholder, awaiting design |
| `/safaris`, `/book-now` | `src/pages/Safaris.jsx` | Placeholder |
| `/aboutus` | `src/pages/About.jsx` | Placeholder |
| `/gallery` | `src/pages/Gallery.jsx` | Placeholder |
| `/booking` | `src/pages/Booking.jsx` | Placeholder |
| `/dream-dhow` | `src/pages/DreamDhow.jsx` | Placeholder |
| `/cookies-policy`, `/privacy-policy`, `/terms-of-service` | `src/pages/Policy.jsx` | Placeholder |
| `*` | `src/pages/NotFound.jsx` | 404 |

The placeholder pages exist so the inventory routes don't 404 and so the
homepage doesn't break if anything links to them. Each will be rebuilt the same
way the homepage was — paste the next Claude design and we port it.

## Project layout

```
public/
  assets/
    brand/       # Destination Paradise logo assets
    fonts/       # Playfair Display, Montserrat, Kaushan Script
    images/
      home/      # Homepage hero and place images
      excursions/ # Trip-specific card/gallery images
      testimonials/ # Guest avatar images
  _redirects     # SPA fallback (also defined in netlify.toml)
src/
  main.jsx
  App.jsx
  styles/
    tokens.css      # Design tokens + @font-face (from colors_and_type.css)
    homepage.css    # Homepage layout + components (from styles.css)
  pages/        # one file per route
  components/
    Placeholder.jsx
netlify/
  functions/
    planner.mjs # AI Trip Planner — calls Anthropic Messages API
netlify.toml    # Build + redirects (/api/planner → function)
```

## What came from the design vs. what we filled in

**From the design (`/tmp/dp-design/destination-paradise/project/`):**

- `Homepage.html` → `src/pages/Homepage.jsx` (markup ported, scripts rewritten as React state/effects)
- `styles.css` → `src/styles/homepage.css` (verbatim, with asset URLs rewritten to `/assets/...`)
- `assets/colors_and_type.css` → `src/styles/tokens.css` (verbatim, with font URLs rewritten)
- `assets/fonts/*` → `public/assets/fonts/*`
- `assets/img/*` → `public/assets/images/*` and `public/assets/brand/*`

**Filled in:**

- Netlify Function for the AI planner (the design called `window.claude.complete`
  which only exists inside claude.ai — a real Anthropic API call replaces it).
- Newsletter form wired for Netlify Forms.
- React Router + placeholder pages for the other routes from
  `docs/content-inventory.md`.

**Left blank / needs you to provide:**

- Real social-media URLs in the footer (currently `href="#"` per the design).
- Real footer contact info — design uses `hello@destinationparadise.co.tz` and
  `+255 000 000 000`. Old site had `info@yournexttriptoparadise.com` and
  `+255 768 779 517`. Pick one and we'll update.
- Designs for the other 8 routes.

## Notes for redesign continuity

The `tweaks` panel from the design (hero variant, excursion layout, theme) is
preserved so design iteration is one click away when running inside the
claude.ai design preview. In production it stays hidden — the gear button only
appears when the parent frame sends `__activate_edit_mode`.

The previous repo's archive lives in [`docs/website-assets/`](docs/website-assets/)
and remains a content-inventory snapshot only — it is no longer used by the live
build. (Worth pruning to git-lfs or external storage; flagged in the prior review.)
