# Implementation validation — 5 September 2026

## Automated checks

- `npm run typecheck`: passed.
- `npm test`: 47 passed, zero failed, including the installed Router decoder compatibility and bounded malformed-input regression.
- Standalone mobile backend tests: 24 passed, zero failed.
- `npm run content:check`: generated content matches the current website sources (24 destinations, 32 food places, 6 events, 12 months).
- `npx expo-doctor`: 21/21 passed.
- `npm run export`: final iOS Hermes, Android Hermes and web production bundles completed with the dedicated mobile endpoint configuration. Exported JavaScript bundles are not signed installable apps.
- A fresh EAS archive included the vendored decoder and its license; clean `npm ci` using npm 10.9.4 passed. Typecheck and all-platform export also passed from that clean installation. Two website-source provenance tests require the full repository, which is intentionally excluded from the mobile archive; the complete repository suite passed 47/47.
- [Source fingerprints](release/build-source-sha256.json) identify 17 files matched to the final endpoint-configured EAS archive and separately identify the deployed privacy source. The original manifest is preserved. A later addition of only `submit.production.ios` to `eas.json` is separately fingerprinted in [submission-config-update.json](release/submission-config-update.json); all runtime/build settings remain unchanged.
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

Both reached React Native Fabric `Running main` with Destination Paradise's manifest and foreground activity. Runtime logs contained no fatal or ReactNativeJS errors. That initial launch check did not establish visual/gesture/keyboard behavior. Later Android `adb` captures and interactions are recorded separately below.

## Android Weather rotation regression and development verification

On the first production Android candidate, version `1.0.0` / code `3`, rotating the phone from portrait 1080×2424 to landscape 2424×1080 left the seasonal column wider than the screen. The description was clipped to one line and later month buttons extended beyond the right edge. The failure persisted after 35 seconds. The [initial candidate manifest](release/assets/android/capture-manifest.json) and [original failure capture](release/assets/android/qa/phone-weather-landscape-overflow.png) preserve that release-artifact evidence.

The isolated fix in `src/features/weather/weather-screen.tsx` constrains the outer row to `100%` width and gives the seasonal column an explicit width in both layouts: `100%` on narrow screens and `0` plus `flexGrow: 1` on wide screens, with shrinking and `minWidth: 0`. This lets the column fill the actual remaining width on rotation. No weather API, design content, animation, preference or navigation behavior changed. Typecheck passed after the edit. The tested file SHA-256 is `3b843f7b24b0430d94e50473d9125c0bec0462a636c5a024cd32d0443408ec73`.

The corrected source was then exercised in **Expo Go 57.0.9**, using the live dedicated mobile weather backend. These are development-runtime results, not claims about the replacement signed build:

- Phone API 36 ARM64: portrait 1080×2424 → landscape 2424×1080 → portrait → landscape. All twelve month buttons remained visible. The seasonal description wrapped to 100px height, with its right edge at 2345px inside the 2424px screen; the previous failing description was clipped to 50px height. Selecting December showed 31 °C, the complete description and Plan button, with selection retained through rotation.
- Tablet API 36 ARM64: landscape 2560×1600 → portrait 1600×2560 → landscape. Both columns and cards remained within the screen at 1280dp and 800dp widths. Navigation changed between the rail and bottom tabs correctly.
- Live Apple Weather, 24 °C / Mostly clear / 86% humidity in these captures, remained visible with its observation time, Apple attribution and unavailable sea temperature. No AI, report, contact or quote was submitted.

[The compact QA manifest](release/assets/android/qa/weather-layout-go-manifest.json) records source identity, device sizes, exact results and hashes for eight untouched PNGs. They are development QA evidence with Expo Go UI and must not be used as store screenshots. The temporary Metro server on port 8084 was stopped and its two `adb reverse` rules removed; the existing port 8082 server was unchanged. Both emulators were returned to the installed standalone app.

Corrected cloud archives were uploaded after verification: Android code `4`, build `d5ad03c9-bca0-4d33-9ba5-2c9cebe89260`, and iOS build `3`, build `a8eb3b90-eb2c-4f2d-a6fb-1fd3507bf876`. The [archive manifest](release/weather-layout-build-source-sha256.json) identifies the 82 matching archived source files. This documentation update happened after archive upload. Android replacement-artifact verification is recorded below; no store submission is implied.

## Corrected production-derived Android artifact — code 4

EAS build `d5ad03c9-bca0-4d33-9ba5-2c9cebe89260` finished at `2026-09-05T22:03:13.040Z`. The AAB was resolved through the official EAS CLI and downloaded with redirects. `bundletool 1.18.3 validate` passed. AAB SHA-256: `4d9e8e899191850d22e1f6ccf2edcbd0acb647c2ccdd9b98427f883411a1218c` (77,144,054 bytes).

The exact AAB was converted to a universal APK with the existing dedicated local Android Debug certificate, without source changes or access to the production keystore. APK SHA-256: `02909f064d7423c94614dc23876765b67e8dc6fcfc23845798c931c504c06591`; signer SHA-256: `09148a81ca65ab839704593853320acac5934935239c3077c1369b3038e1598f`. APK signature verification passed. Both emulators received `adb install -r`, preserving app data, and their installed/running package was verified as `com.yournexttriptoparadise.mobile`, version `1.0.0`, code `4`.

- Both devices cold-launched into Explore and visibly rendered real OSM tiles and numbered destination pins.
- Phone portrait 1080×2424 → landscape 2424×1080 → portrait → landscape passed. All twelve months remained visible, and the description occupied `[1160,382][2345,482]` within the 2424px screen. December showed 31 °C with complete card text and its Plan button within the portrait width; selection remained through rotation.
- Tablet landscape 2560×1600 → portrait 1600×2560 → landscape passed. Live and seasonal columns remained bounded; rail/bottom navigation adapted correctly.
- Real Apple Weather displayed 24 °C, Mostly clear, 86% humidity, sea unavailable, branding/legal attribution and the actual observation time. Pause → Play changed the control and resumed artwork on both devices. Pull-to-refresh also completed during the phone scroll check.
- Second force-stop/cold launches succeeded. Application-process `AndroidRuntime:E` and `ReactNativeJS:E` logs contained zero error lines before and after those launches. No AI, report, contact or quote request was sent.

The **actual merged binary manifest** has minimum API 24, target API 36 and four permissions: `INTERNET`, `VIBRATE`, `ACCESS_NETWORK_STATE`, plus the app-scoped `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. The latter is signature protected. The two extra library declarations are distinct from the earlier Expo-config introspection result; there is no location or storage permission. Debuggable and cleartext traffic are disabled by default in this manifest.

[The code 4 runtime manifest](release/assets/android/qa/code4-runtime-manifest.json) records artifact and signer identity, binary metadata, exact checks and original native captures. This verifies release code executed through a locally signed APK derived from the production AAB. It does not establish Play-generated APK signing/distribution, physical-device behavior, iOS store-signed runtime, store approval or publication.

Three authentic 7-inch-class Android screenshots were also captured from the same installed code 4 APK using a 1200×1920px / 320dpi display override (600×960dp; approximately 7.1-inch nominal diagonal). [Their manifest](release/assets/android/tablet-7/capture-manifest.json) records the emulated profile and untouched PNG/JPEG files for Explore, Planner and Weather. Images were not resized or cropped. The tablet was restored to its original 2560×1600px / 320dpi display and free rotation afterward. The capture set is separate from Expo Go evidence and was not uploaded by the QA task.

## Release boundaries

- The dedicated mobile backend is deployed and verified as detailed below. The iOS Simulator build finished and passed the standalone checks. Android AAB build `29c21f3e-68d3-4b02-b02a-6b12c2bd566d` finished, was downloaded and validated as version `1.0.0` / code `3`; its first internal Play upload was underway in the last snapshot. Signed iOS production build `62008916-18a2-45f0-a27a-77deabe2041f` started at 21:15 UTC as build `2`, with completion unverified. The user confirmed Louis Peter as publisher and both store app records exist. Upload completion, production approval and public availability are separate states.
- No live quote or report email was sent in these checks. Report GET and invalid POST probes do not establish successful report delivery. Email contract, validation, cancellation and uncertain-delivery handling are tested with injected responses.
- Apple WeatherKit uses the existing Apple Developer membership allowance. No Open-Meteo purchase or additional weather subscription was made. Service credentials stay on the server; the app requests fixed Zanzibar weather without device-location permission.
- `decode-uri-component@0.5.0` is vendored with its upstream algorithm and MIT license; only module/declaration exports were adapted for `query-string@7` CommonJS compatibility. `npm audit --omit=dev` now reports 11 moderate propagated entries from `uuid` in Expo's Xcode tooling, with zero high/critical entries. The tooling calls `v4()`; the advisory affects `v3`/`v5`/`v6` with supplied buffers. No affected runtime call was found. Broad automatic downgrade fixes were not applied.
- Effective Expo native introspection leaves Android `INTERNET` and `VIBRATE`. `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE` have merger-removal entries. iOS arbitrary ATS loads are disabled, local networking is allowed, and phone/tablet support plus all four orientations remain. Final binary manifest review remains distinct from introspection.
- Existing unrelated website work was preserved. The main website's published deployment remained `6a8dbf35cb01b33e235abc4b`. Root ESLint excludes the independent mobile package and generated design export; mobile validation runs from this package.

## Verified production backend and cloud-build snapshot

Updated 5 September 2026 at 21:22 UTC from the release operator's verified results. iOS production-build and internal-upload status remain snapshots and must be refreshed before claiming completion.

The dedicated site is `https://destination-paradise-mobile.netlify.app`, site ID `f0fa9f3a-0de9-4e62-9809-d64031c415a2`, production deployment `6a9c808c5bf2edc8e8dfa90a`. Weather, AI reply reports and mobile privacy use this site. Planner chat and quote sending remain on `https://yournexttriptoparadise.com`.

| Check | Verified result |
| --- | --- |
| `GET /api/weather` | HTTP 200; Apple observation `2026-09-05T20:51:08Z`, 23.63 °C, humidity `0.86`, `MostlyClear`. The API preserves the provider timestamp. |
| `GET /api/marine` | HTTP 200; sea value `null`, `Unavailable`. No replacement marine reading is invented. |
| `/api/planner-report` | GET returned 405; invalid POST returned 400. Neither probe sent email. Successful provider acceptance/team receipt remains a separate controlled test. |
| `GET /mobile-privacy.html` | HTTP 200; SHA-1 `7e39c40421544ad0ffc1f402670e2143f6d711e7`, matching the local policy source. |
| Android production build | `29c21f3e-68d3-4b02-b02a-6b12c2bd566d` — `FINISHED`; AAB downloaded/validated, version `1.0.0`, code `3`; first internal Play upload underway at the last snapshot. |
| iOS Simulator build | `e9a5dd2a-d500-4daa-a32e-8fea7de77472` — `FINISHED`; downloaded and installed on iPhone 17 Pro and iPad Pro 11-inch (M5), with standalone map/weather checks passed. |
| iOS production build | `62008916-18a2-45f0-a27a-77deabe2041f` — started 21:15 UTC, build `2`; completion unverified. Existing team `86ZX7JC345` / certificate `Q4TN3C6SBG`, new profile `92C9TGV5GG`. |
| Apple app record | Louis Peter; app `6809042574`; listing `Destination Paradise Zanzibar`; SKU `destination-paradise-mobile`; English (U.S.); bundle `com.yournexttriptoparadise.mobile`. |
| Google app record | App `4972417635244765220`, developer `7868106536966385994`; Destination Paradise; free / English (U.S.); same Android package. Production access not granted. |

Provider cleanup removed the four task-created WeatherKit environment settings from the old website site: deletes returned 204 and follow-up GETs returned 404. Both sites retained their published deployment IDs shown above. Deletion of an unused draft returned 405; it was left unpublished. No additional weather subscription was purchased.

The standalone iOS Simulator evidence is recorded separately from the earlier development runs. Store artifacts still need release QA, including Android visual/keyboard/gesture and physical-device gesture checks. Play promotional icon/feature exports are ready; native store captures and uploads are managed separately. Google requires at least 12 continuously opted-in closed-test testers for 14 days before applying for production access. Neither store is established as publicly released.
