# Destination Paradise

Premium React + Vite website for Destination Paradise, a Zanzibar and Tanzania travel brand covering complete packages, island excursions, mainland safaris, and an AI-assisted trip planner.

The site has grown from a homepage rebuild into a multi-page travel platform:

- 15 package products across safari + Zanzibar, honeymoon, family, fly-in safari, culture, marine, Kilimanjaro, luxury, and long-stay styles.
- 29 safari starting points across core routes and specialist safari styles.
- 40+ Zanzibar excursions and combinations.
- Interactive Explore map for Zanzibar and mainland Tanzania.
- AI Trip Planner backed by a Netlify Function.

## Stack

- Vite + React 18
- React Router 6
- Plain CSS modules by page/section, no preprocessor
- Leaflet for the map experience
- Netlify hosting
- Netlify Function for `/api/planner`
- Netlify Forms for contact/newsletter forms

## Run Locally

```bash
npm install
npm run dev
npm run build
npm run preview
```

Local dev runs at `http://localhost:5173`.

For the AI planner to call the real Netlify Function locally, use Netlify CLI:

```bash
netlify dev
```

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # production build to dist/
npm run preview    # preview built dist/
npm run lint       # ESLint
npm run typecheck  # TypeScript check config
npm run test       # Vitest tests
```

## Environment

Set this on Netlify:

- `ANTHROPIC_API_KEY` — required for the AI Trip Planner. Without it, the planner returns a friendly fallback message and points guests to WhatsApp.

The planner endpoint is configured in `netlify.toml`:

- Frontend calls `/api/planner`
- Netlify rewrites that to `/.netlify/functions/planner`
- Function file: `netlify/functions/planner.mjs`

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage with hero, featured excursions, safari highlights, package highlights, planner, map, gallery, contact |
| `/excursions` | Full excursions index with filters and progressive reveal |
| `/excursions/:id` | Excursion detail pages |
| `/excursions/combinations/:id` | Excursion combination detail pages |
| `/safaris` | Safari index with filters, safari route cards, safari styles, and selling sections |
| `/safaris/:id` | Safari detail pages |
| `/safaris/types/:typeId` | Safari style/type pages |
| `/packages` | Package portfolio page |
| `/packages/:id` | Package detail pages |
| `/trip-planner` | AI Trip Planner page with prompt cards and chat UI |
| `/explore` | Interactive Explore page with map, destination hubs, related products, and CTA |
| `/booking`, `/book-now` | Booking request, quote, and payment-link entry point |
| `/aboutus` | About placeholder |
| `/cookies-policy`, `/privacy-policy`, `/terms-of-service` | Policy pages |
| `*` | 404 page |

## Project Layout

```text
public/
  assets/
    brand/          # logo assets
    fonts/          # local font files
    images/
      home/         # homepage/place imagery
      excursions/   # Zanzibar excursion imagery
      safaris/      # safari imagery
      testimonials/ # testimonial avatars
src/
  App.jsx
  main.jsx
  components/
    SiteLayout.jsx
    SiteNav.jsx
    SiteFooter.jsx
    homepage/       # homepage sections
  data/
    excursionsData.js
    excursionCombinations.js
    destinationParadisePackages.js
    safariPricing.js
    nextLevelSafariProducts.js
  pages/
    Homepage.jsx
    Excursions.jsx
    Safaris.jsx
    Packages.jsx
    TripPlannerPage.jsx
    Explore.jsx
    *Detail.jsx
  styles/
    tokens.css
    homepage.css
    homepage/       # split homepage section styles
    excursions.css
    safaris.css
netlify/
  functions/
    planner.mjs
netlify.toml
```

## Main Data Files

- `src/data/excursionsData.js`  
  Full Zanzibar excursion catalog, including rich editorial detail for headline excursions and lean entries for the broader catalog.

- `src/data/excursionCombinations.js`  
  Combination products that group multiple excursions into route-style experiences.

- `src/data/destinationParadisePackages.js`  
  Current package portfolio used by package listing/detail pages and homepage package highlights.

- `src/data/safariPricing.js`  
  Core safari route pricing and inclusions.

- `src/data/nextLevelSafariProducts.js`  
  Extended safari/special-interest product list used to expand the safari catalog.

## Design Notes

- The site is positioned as a premium travel concierge/platform, not just a local activity marketplace.
- Global button variants live in `src/styles/homepage/buttons.css`.
- The navbar order is intentional: logo, navigation, theme toggle, primary booking CTA.
- The WhatsApp floating action button is styled to fit the site’s dark glass/gradient visual language while retaining a subtle green signal.
- Homepage currently uses available local images as placeholders. Higher-quality cinematic Zanzibar/safari media can be dropped into `public/assets/images/...` and referenced from the relevant components.

## Current Product Structure

Homepage is intentionally curated rather than exhaustive:

- Shows 3 featured excursions.
- Shows 3 safari highlights from the current safari data.
- Shows 3 package highlights from the current package data.
- Uses the planner and Explore map to help guests choose paths.

Full catalogs live on their own pages:

- Excursions page for the full excursion catalog.
- Safaris page for core routes plus specialist products.
- Packages page for the complete package portfolio.
- Explore page for location-first discovery.

## Deployment

Netlify build settings:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

SPA fallback and the planner API rewrite are defined in `netlify.toml`.

## Notes

- Some media is temporary and should be replaced with higher-resolution brand photography or video as it becomes available.
