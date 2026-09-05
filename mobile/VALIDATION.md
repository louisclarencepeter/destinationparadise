# Implementation validation — 5 September 2026

## Automated checks

- `npm run typecheck`: passed.
- `npm test`: 47 passed, zero failed, including the installed Router decoder compatibility and bounded malformed-input regression.
- Standalone mobile backend tests: 24 passed, zero failed.
- `npm run content:check`: generated content matches the current website sources (24 destinations, 32 food places, 6 events, 12 months).
- `npx expo-doctor`: 21/21 passed.
- `npm run export`: final iOS Hermes, Android Hermes and web production bundles completed with the dedicated mobile endpoint configuration. Exported JavaScript bundles are not signed installable apps.
- A fresh EAS archive included the vendored decoder and its license; clean `npm ci` using npm 10.9.4 passed. Typecheck and all-platform export also passed from that clean installation. Two website-source provenance tests require the full repository, which is intentionally excluded from the mobile archive; the complete repository suite passed 47/47.
- [Source fingerprints](release/build-source-sha256.json) identify 17 files matched to the final endpoint-configured EAS archive and separately identify the deployed privacy source. This manifest was preserved during the status update.
- Run script Bash syntax/help and Git whitespace checks passed. No temporary scroll instrumentation remains.

## Browser interaction checks

Executed the actual Expo app at phone 390×844, landscape 844×390, and tablet 768×1024, 1024×768 and 820×1180 dimensions.

- Real OSM tiles and all Zanzibar/Mainland pins rendered. Initial map fitting, zoom/fit, stable viewport after selection, phone sheets, tablet sidebars and list switching checked.
- Combined search/category/region/saved filters, empty-state recovery and saved-state persistence checked.
- Destination details, representative-photo caption, island food/event guide, and Serengeti-to-Planner handoff checked.
- Temporarily blocked tile traffic in an isolated QA frame: map connection error appeared; restored traffic and Retry recovered real tiles. Temporary network overrides removed afterward.
- Real `/api/planner` returned HTTP 200 and visible AI replies/itineraries through the fixed local proxy. Month changes revised the draft and invalidated stale review. Retry/cancel/reset, full transcript, contact form and consent/send gating checked. No quote was submitted and no contact details were entered.
- Weather loading, source timestamps, offline/stale readings, reconnection and month-to-Planner handoff were checked during implementation. The final release uses Apple Weather through WeatherKit; its live endpoint results are recorded below. Sea temperature is now unavailable, with no marine-provider fallback.
- After production deployment, browser Weather displayed the new Apple values (rounded 24 °C, `MostlyClear`, humidity 86%, sea unavailable) and Pause/Play worked.

## Earlier native iOS execution through Expo Go

Official Expo Go 57.0.9 installed on iOS 26.5 simulators: iPhone 17 Pro and iPad Pro 11-inch (M5).

- iPhone: real map, numbered pins, selected halo/label, destination sheet and Nungwi coast photo visibly rendered. Map-to-Planner destination handoff worked.
- iPad: real map/sidebar and Nungwi selection worked; saved destination handoff worked. Live weather rendered correctly in landscape with the navigation rail.
- iPhone sent a synthetic planning request directly to the website backend and rendered its real response. No email send occurred. Text entry and the software keyboard were checked: composer and Send stayed above the keyboard; bottom navigation hid. The synthetic conversation was reset afterward.
- Native app-information page and the saved-data reset confirmation/cancel controls worked.

Native inspection exposed and fixed explicit image-size requirements, phone-column flex sizing, duplicate safe-area padding and the localhost IPv6/IPv4 development-server mismatch.

CUA drag/scroll calls did not generate native scroll events in this Simulator session, including on the separate app-information page. Temporary diagnostics confirmed a valid phone scroll frame (402×783) and larger content (402×2216). Navigation, inputs and controls were exercised through native accessibility actions. Manual touch scrolling/pinch gestures on physical devices remain a release QA item; gesture success is not claimed from these checks.

## Standalone iOS Simulator build

EAS build `e9a5dd2a-d500-4daa-a32e-8fea7de77472` finished. Its artifact was downloaded and the actual standalone bundle `com.yournexttriptoparadise.mobile` was installed on iPhone 17 Pro and iPad Pro 11-inch (M5) simulators. These checks used the standalone app, separately from the earlier Expo Go run.

- iPhone Explore visibly rendered real OSM tiles, all seven Zanzibar pins and the dark map.
- iPhone Weather displayed 24 °C (rounded from the provider reading), `MostlyClear`, humidity 86%, sea `Unavailable`, the Apple Weather logo/legal attribution and source observation time `2026-09-05T20:51:08Z`. Pause → Play → Pause worked.
- iPad landscape rendered the map and destination sidebar. Selecting Paje opened its destination details.
- iPad Weather showed the same live Apple values with the responsive two-column layout.
- Rotating iPad from landscape to portrait preserved correct weather, two columns and bottom tabs without overflow.

The compiled standalone `Info.plist` was inspected: bundle `com.yournexttriptoparadise.mobile`, version `1.0.0`, build `1`, minimum iOS `16.4`, `UIDeviceFamily` `[1,2]`, and all four orientations for phone and tablet. ATS arbitrary loads are `false`, local networking is `true`, and non-exempt encryption is `false`. This is artifact-level configuration evidence; it does not replace store-distribution signing or SDK privacy-manifest review.

This verifies the downloaded Simulator artifact and observed interactions. It does not establish an iOS App Store build, physical-device behavior, final store screenshots or Android visual/keyboard/gesture completion.

## Dark weather and motion update

- Browser frame sampling confirmed intermediate opacity/translation during tab changes, weather-month reveals and the ambient moon/stars. The latter produced 172 style updates over 700 ms; pausing, leaving Weather, or enabling reduced motion produced zero updates during the sampled intervals.
- Live browser Reduce Motion also removed tab fades and month-card movement. Temporary media overrides and instrumentation were removed, and the browser viewport was restored.
- The dark live clear-night card was visually checked at phone 390×844, narrow tablet 768×1024, and the desktop preview width. No horizontal page overflow; temperature, artwork, controls and source text remained readable.
- iPhone Expo Go rendered the moon, stars and dark card with real weather data; native Pause/Play and tab navigation worked. Native inspection caught an SVG gradient offset format warning, corrected to explicit percentage stops.
- Generated-map runtime tests verify selection and live motion-preference updates retain the map instance and viewport. Browser destination selection retained the existing iframe.
- Weather-scene tests distinguish actual day/night, cloud/fog/unknown states, and rain/snow/hail codes. Alternate condition artwork was not visually exercised against live weather; only the actual clear-night reading was used for the visual checks.
- Ambient effects use native-driver transforms/opacity on iOS and Android and stop through route focus, AppState, pause and reduced-motion hooks. Physical-device gesture and Android visual QA remain subject to the release checks below.

## Native Android execution

Official Expo Go 57.0.9 installed and launched the app on API 36 ARM64 Google APIs emulators:

- Pixel 9: 1080×2424, 420 dpi, `emulator-5554`.
- Pixel Tablet: 2560×1600, 320 dpi, `emulator-5556`.

Both reached React Native Fabric `Running main` with Destination Paradise's manifest and foreground activity. Runtime logs contained no fatal or ReactNativeJS errors. CUA could not resolve the emulator executable as an app, so Android visual/gesture/keyboard interaction is not claimed. Complete that check on physical Android devices or a controllable emulator before release.

## Release boundaries

- The dedicated mobile backend is deployed and verified as detailed below. The iOS Simulator build finished, was downloaded and passed the standalone checks above. Android production was `IN_PROGRESS` in its last supplied snapshot. Completed store-distributable artifacts, TestFlight/Play uploads and store submissions are not established. Publisher identity remains awaiting the owner's answer.
- No live quote or report email was sent in these checks. Report GET and invalid POST probes do not establish successful report delivery. Email contract, validation, cancellation and uncertain-delivery handling are tested with injected responses.
- Apple WeatherKit uses the existing Apple Developer membership allowance. No Open-Meteo purchase or additional weather subscription was made. Service credentials stay on the server; the app requests fixed Zanzibar weather without device-location permission.
- `decode-uri-component@0.5.0` is vendored with its upstream algorithm and MIT license; only module/declaration exports were adapted for `query-string@7` CommonJS compatibility. `npm audit --omit=dev` now reports 11 moderate propagated entries from `uuid` in Expo's Xcode tooling, with zero high/critical entries. The tooling calls `v4()`; the advisory affects `v3`/`v5`/`v6` with supplied buffers. No affected runtime call was found. Broad automatic downgrade fixes were not applied.
- Effective Expo native introspection leaves Android `INTERNET` and `VIBRATE`. `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE` have merger-removal entries. iOS arbitrary ATS loads are disabled, local networking is allowed, and phone/tablet support plus all four orientations remain. Final binary manifest review remains distinct from introspection.
- Existing unrelated website work was preserved. The main website's published deployment remained `6a8dbf35cb01b33e235abc4b`. Root ESLint excludes the independent mobile package and generated design export; mobile validation runs from this package.

## Verified production backend and cloud-build snapshot

Updated 5 September 2026 at 21:00 UTC from the release operator's verified results. Android cloud-build status remains the last supplied snapshot and must be refreshed before claiming completion.

The dedicated site is `https://destination-paradise-mobile.netlify.app`, site ID `f0fa9f3a-0de9-4e62-9809-d64031c415a2`, production deployment `6a9c808c5bf2edc8e8dfa90a`. Weather, AI reply reports and mobile privacy use this site. Planner chat and quote sending remain on `https://yournexttriptoparadise.com`.

| Check | Verified result |
| --- | --- |
| `GET /api/weather` | HTTP 200; Apple observation `2026-09-05T20:51:08Z`, 23.63 °C, humidity `0.86`, `MostlyClear`. The API preserves the provider timestamp. |
| `GET /api/marine` | HTTP 200; sea value `null`, `Unavailable`. No replacement marine reading is invented. |
| `/api/planner-report` | GET returned 405; invalid POST returned 400. Neither probe sent email. Successful provider acceptance/team receipt remains a separate controlled test. |
| `GET /mobile-privacy.html` | HTTP 200; SHA-1 `7e39c40421544ad0ffc1f402670e2143f6d711e7`, matching the local policy source. |
| Android production build | `29c21f3e-68d3-4b02-b02a-6b12c2bd566d` — `IN_PROGRESS` at the last snapshot. |
| iOS Simulator build | `e9a5dd2a-d500-4daa-a32e-8fea7de77472` — `FINISHED`; downloaded and installed on iPhone 17 Pro and iPad Pro 11-inch (M5), with standalone map/weather checks passed. |

Provider cleanup removed the four task-created WeatherKit environment settings from the old website site: deletes returned 204 and follow-up GETs returned 404. Both sites retained their published deployment IDs shown above. Deletion of an unused draft returned 405; it was left unpublished. No additional weather subscription was purchased.

The standalone iOS Simulator evidence is recorded separately from the earlier development runs. Store artifacts still need release QA, including the open Android visual/keyboard/gesture and physical-device gesture checks. Final store assets have not been produced and stores have not been submitted.
