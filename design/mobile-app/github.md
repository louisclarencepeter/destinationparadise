# Source repository

repo: louisclarencepeter/destinationparadise
branch: main
path: src/, public/assets/

## Last sync

date: 2026-09-05T17:15:00Z

### Updated in this project

- Built the Destination Paradise mobile app prototype (Explore, Planner, Weather) from repo content and brand assets.
- Copied 27 real brand/photography assets from `public/assets/` into the project.
- Destination pins use the repo's real coordinates; Leaflet + OpenStreetMap tiles as on the live Explore page.
- Food & events guide, destination hubs and season table use the repo's English copy verbatim.

## Screen map

| Screen / state | Built from |
| --- | --- |
| Explore list, category chips, search | `src/data/explorePageContent.js`, `src/locales/en/explore.json` |
| Explore map + destination bottom sheet | `src/data/destinationMapPins.js`, `src/pages/Explore.jsx` (Leaflet) |
| Destination detail (Stone Town, Nungwi, Serengeti, all 24) | `src/data/explorePageContent.js` (`DESTINATION_HUBS`), `src/locales/en/explore.json` (`hubs`) |
| Food & events guide (8 areas, 32 places, 6 events) | `src/components/explore/ExploreLocalGuide.jsx`, `src/locales/en/explore.json` (`local_guide`) |
| Paradise Planner start / chat / privacy sheet | `src/components/homepage/PlannerSection.jsx`, `src/pages/TripPlannerPage.jsx`, `src/utils/plannerHandoff.js` |
| Weather now + seasonal guide | `src/components/homepage/WeatherSection.jsx`, `src/styles/homepage/weather.css` |
| Brand assets, logo, imagery | `public/assets/brand/`, `public/assets/images/{home,excursions,excursions/trips,safaris}/` |
| Colors, type, gradients, radii | Destination Paradise Design System (`_ds/…/colors_and_type.css`), from `src/styles/_variables.scss` |
