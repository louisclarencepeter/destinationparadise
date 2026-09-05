# Store asset plan

Prepared 5 September 2026. Capture the final candidate after privacy/reporting and the Apple WeatherKit replacement. Existing browser/native development checks are evidence of implementation, not finished store assets.

## Current files

| File | Observed dimensions | Use |
| --- | --- | --- |
| `../assets/icon.png` | 1024 × 1024, no alpha | Existing iOS app icon source. Confirm brand/content rights and final build appearance. |
| `../assets/android-icon-foreground.png` | 1024 × 1024, alpha | Android adaptive foreground; not a finished flat Play listing icon. |
| `../assets/splash-icon.png` | App splash source | Not a store screenshot or feature graphic. |
| `../assets/apple-weather-dark.png` | Bundled official attribution PNG | Displayed locally with the Apple Weather legal-attribution link; retain this branding in weather screenshots. |

No final store screenshot set or feature graphic was present in `mobile/release/` when this audit began. Native QA used iPhone 17 Pro and iPad 11-inch; those are useful QA targets but do not by themselves satisfy the required largest Apple screenshot slots.

## Capture set

Capture authentic native UI with final app branding, no Expo Go menu, browser chrome, warnings or real customer information. Use a synthetic itinerary and leave the quote unsent. Retain map attribution, official Apple Weather logo/legal attribution and representative-photo labels. Weather may show the actual available reading with its timestamp; do not present illustrative values as live observations. Sea temperature is unavailable from WeatherKit; do not reuse an earlier provider's value in a screenshot of the new release.

| Slot | Scene | Suggested short caption |
| --- | --- | --- |
| 1 | Explore Zanzibar map with numbered pins and Stone Town selected | Your island, on the map |
| 2 | Nungwi detail with real coast image and saved heart | Keep the places you love |
| 3 | Mainland map/list with safari destinations | Beyond the island |
| 4 | Planner trip preferences | A journey shaped around you |
| 5 | Clearly labelled AI draft, no personal data | From an idea to a trip draft |
| 6 | Weather reading and dark sky illustration | Find your season |
| 7, optional | Food guide | Where we send friends to eat |

For tablets capture the genuine sidebar/map layout and wider Planner/Weather compositions. Do not stretch phone images into tablet screenshots.

## Platform delivery

Apple: provide 1–10 JPEG/PNG screenshots without alpha for the required phone and iPad slots. Prefer a 6.9-inch phone capture at 1320 × 2868 and a 13-inch iPad capture at 2064 × 2752 (or corresponding landscape dimensions). Other accepted dimensions and fallback slots exist; confirm the selected slot in App Store Connect. iPad's 13-inch slot is required when the app supports iPad. [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)

Google Play: capture phone and tablet sets for their actual form factors, and create the required 1024 × 500 JPEG/24-bit PNG feature graphic without alpha. Export a separate listing icon in the format requested by Play Console. Screenshots must depict the app and fit Play's current dimensions/content rules. [Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)

Optional videos should show genuine app use; no video is needed merely to prove native animations work. Provide a still image for each important feature.

## Rights and AI provenance

The app uses source-backed website photography; Mainland images are explicitly representative safari inspiration. Existing website use does not alone prove mobile-store promotional rights. Confirm the operator holds the necessary logo/photo rights.

Google now asks for an AI declaration for each submitted visual asset. Review the actual image/video provenance individually. A screenshot containing a generated AI itinerary, generated promotional art or edited photography requires a considered declaration; coding assistance alone does not establish the provenance of every visual. [Play AI-asset declaration guidance](https://support.google.com/googleplay/android-developer/answer/17262077?hl=en)

Keep originals, final exports, source/provenance, final candidate build number and device dimensions together in a later `release/assets/` folder. No generated assets or screenshots were fabricated by this audit.
