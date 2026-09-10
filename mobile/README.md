# Destination Paradise mobile

Native iOS and Android app for phones and tablets, implemented from the approved Claude Design export in `../design/mobile-app/`. Expo SDK 57, React Native 0.86, TypeScript, and Expo Router. The independent package keeps website dependencies separate.

## Run

Requires Node 22.13 or newer (tested with Node 24), npm, and Expo Go for SDK 57. iOS requires macOS/Xcode for the simulator; Android requires an emulator or connected phone.

```sh
cd mobile
npm ci
./script/build_and_run.sh
```

Scan the Expo QR code from a phone on the same network. Use `--ios`, `--android`, or `--web` for those targets. The Codex Run action is configured inside this mobile package; open `mobile/` as the project to use it. For a localhost-only session use `NODE_OPTIONS=--dns-result-order=ipv4first npx expo start --localhost --port 8081`; the run script already sets IPv4-first DNS to avoid Node 24 binding only to IPv6 while Expo advertises an IPv4 simulator URL.

If macOS uses Command Line Tools as its default developer directory, use a per-command override:

```sh
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer ./script/build_and_run.sh --ios
```

The app supports both orientations, uses safe-area insets, and adapts to the available width. Explore uses a destination sidebar from 768 points; the navigation rail appears from 1100 points. Smaller screens keep bottom tabs and destination sheets. The package identifiers are `com.yournexttriptoparadise.mobile` for both platforms.

## Features

- Explore: 24 geographically positioned website destinations, region/category/search/saved filters, map/list, detail sheets, related experiences and packages, day trips, and the island food/events guide.
- Map: bundled Leaflet 1.9.4 in a dedicated native WebView (sandboxed iframe for web). Real OpenStreetMap tiles, dark styling, numbered white/coral pins, selected halo, labels, pan/zoom/fit, attribution, retry and list fallback. The rest of the app uses native React Native components.
- Planner: trip preferences, four starter themes, destination/month handoffs, consent before AI, actual website chat, retry/cancel, draft/transcript review, and an explicitly submitted contact form. Quote requests are never automatically sent or retried. Ambiguous delivery locks further submission and directs the traveller to contact the team.
- Weather: current Zanzibar conditions from Apple Weather, timestamps and attribution, partial-data/error states, and the website's twelve-month seasonal guide with Planner handoff. Sea temperature is unavailable. The dark weather illustration follows reported day/night and condition codes, with gentle sky and precipitation motion. Pause/Play is available; ambient loops stop when Weather loses focus, the app backgrounds, or Reduce Motion is enabled.
- Local storage: saved destination IDs and non-sensitive trip preferences only. Chat and contact fields are session memory. App information includes privacy/source links and a confirmed reset of saved trip data.
- Motion: short tab fades, button press feedback, save-heart confirmation, destination and Planner reveals, photo crossfades and weather-month transitions. Content stays mounted so navigation does not reset the map or forms. System Reduce Motion is observed live on both native platforms and web.

## Content and services

```sh
npm run content:sync   # Regenerate bundled data from website source files
npm run content:check  # Detect drift without writing
```

Generated content records source SHA256 hashes, source review status and image provenance. Mainland photos are existing representative safari photography and carry visible captions. Zanzibar photo labels name the source locality. Food/event entries retain website verification notes; opening hours and schedules must be confirmed with the venue.

Native Planner calls the website's existing HTTPS `/api/planner` and `/api/planner-send` endpoints. The mobile app does not contain server API keys. Web development uses the exact two-path proxy in `metro.config.cjs` because the website rejects cross-origin browser requests. A static web deployment would need same-origin routing for these APIs; it is a preview target for this native app, not a separately deployed website.

Live weather uses Apple WeatherKit through `https://destination-paradise-mobile.netlify.app/api/weather` under the existing Apple Developer allowance. The dedicated mobile backend also hosts AI reports and the privacy page; Planner chat/send remain on the existing website. Signing credentials stay on the server; see [WEATHER_RELEASE.md](WEATHER_RELEASE.md) for activation and verification. The app bundles Apple's official trademark asset and links its legal attribution. Sea temperature is unavailable because WeatherKit does not supply it. There is no public Open-Meteo fallback or new weather subscription. Maps follow https://operations.osmfoundation.org/policies/tiles/; keep visible attribution, identification, normal HTTP caching, and no bulk/offline prefetch. Reassess a production tile provider as traffic grows. CARTO's keyless endpoints were intentionally not used: live reference testing showed an API-key-required watermark.

## Validate

```sh
npm run typecheck
npm test
npm run content:check
npx expo-doctor
npm run export
```

Tests check geography/source parity, filter composition, map bridge trust boundaries, persisted-data validation, website payload limits, explicit send behavior, ambiguous delivery, cancellation/timeouts, weather timestamps and honest unavailable states. Browser and native runtime checks are recorded in `VALIDATION.md`. Never send a live quote as an automated smoke test.

The map runtime is checked in to make the app self-contained. Rebuild it after deliberately updating Leaflet:

```sh
node src/components/map/bundle-leaflet.cjs
```

## Distribution

`eas.json` includes internal preview (Android APK), iOS simulator, and production profiles. EAS project linking, signing, Apple/Google account configuration, store metadata/privacy declarations and release submissions are separate steps. No EAS project ID, signing credential, store upload or public release was created during implementation. Native minimum OS support follows Expo SDK 57 (iOS 16.4 / Android 7 or later); test the oldest supported devices before store release.

The app is English, matching the approved mobile design. Website content and outbound pages keep their existing language behavior.
