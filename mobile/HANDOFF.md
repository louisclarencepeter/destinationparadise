# Destination Paradise Mobile — Project Handoff

**Current Date:** 8 September 2026

**Package:** `destination-paradise-mobile` (`com.yournexttriptoparadise.mobile`)

**Workspace:** `/Users/louisclarencepetersgmail.com/Projects/destinationparadise/mobile`

**Current Version:** `1.1.0` (iOS Build `6`, Android Version Code `8`)

**Working Branch:** `development` — mobile history reconciled onto remote development base `fb3b9489`; the original runtime commit for the published 1.1.0 binaries is `2b92765c` (reconciled equivalent `46fad773`)

**Handoff Verified:** 8 September 2026 (repository reconciliation and local validation; store observations below remain dated 7 September)

**Author / Publisher:** Louis Peter (`louisclarencepeters@gmail.com`)

---

## 1. Executive Summary

Destination Paradise Mobile is a cross-platform iOS and Android application built with **Expo SDK 57**, **React Native 0.86.3**, **React 19.2.3**, and **Expo Router 57**. It provides an interactive travel guide, AI-assisted trip planner, live weather, and location-aware recommendations for Zanzibar and mainland Tanzania.

The application has advanced through initial production builds, icon and layout revisions, and the **Version 1.1.0 "Near Me" update**. The latest preserved store observations, dated **7 September 2026**, establish the following private owner-testing state; the consoles were not refreshed during the 8 September repository reconciliation:

* **iOS:** `1.1.0 (6)` is **Complete** in App Store Connect, active in the owner TestFlight group (**Testing**), and attached to the saved App Store `1.1.0` "Prepare for Submission" draft.
* **Android:** `1.1.0 (8)` is published as **Internal Release 5** on Google Play Console (**Active / Available to internal testers**). Compatible with **12,477 phone models and 6,690 tablets** with zero lost devices.

Public store launch is pending manual account prerequisites (DSA trader status, country availability, and Google Play closed-testing requirements).

> **Source-control reconciliation — 8 September.** All ten mobile commits were transferred, in order, onto remote `development` in an isolated worktree. This handoff, `design/mobile-app/`, and the preserved release evidence are now included in that history. The nine older local website commits and the primary checkout's unfinished website edits were kept intact. That primary checkout remains intentionally divergent: do not push it wholesale. Start further shared work from current `origin/development`, use temporary branches only as needed, merge back into `development`, and delete completed temporary branches. Do not open a `development` → `main` PR without an explicit user request. See [RECONCILIATION.md](release/RECONCILIATION.md) for the commit mapping and validation scope.

---

## 2. Technology Stack & Architecture

| Layer | Technologies & Dependencies | Notes |
| :--- | :--- | :--- |
| **Framework** | Expo SDK `~57.0.20`, Expo Router `~57.0.19` | File-based routing in `app/` |
| **Runtime** | React Native `0.86.3`, React `19.2.3`, Hermes engine | Strict TypeScript `~6.0.3` |
| **UI & Layout** | React Native Safe Area Context, Reanimated `4.5.1`, SVG | Supports phones & tablets (adaptive rail/sheets) |
| **Typography** | Kaushan Script, Montserrat, Playfair Display | Brand typography loaded via Expo Font |
| **Map Engine** | Bundled Leaflet `1.9.4` inside native `react-native-webview` | Sandboxed offline JS bridge, OSM dark tiles |
| **Location** | `expo-location` `~57.0.16` | Coarse/approximate foreground-only, opt-in |
| **State & Cache** | `@tanstack/react-query` `^5.102.8`, `@react-native-async-storage/async-storage` | Session-only forms; non-sensitive saved IDs only |
| **Weather** | Apple WeatherKit via dedicated Netlify function proxy | `https://destination-paradise-mobile.netlify.app/api/weather` |
| **AI Planner** | Netlify serverless proxy to Anthropic Claude | Calls `https://yournexttriptoparadise.com/api/planner` |

---

## 3. Core Features & Current Implementation

### 3.1 Explore Tab
* **Interactive Map:** 24 geographically positioned destinations across Zanzibar archipelago and mainland Tanzania national parks (Serengeti, Ngorongoro, Tarangire, Kilimanjaro, etc.).
* **Native Leaflet Bridge:** Runs bundled Leaflet 1.9.4 inside a dedicated `WebView` (`src/components/map/`). Uses custom dark OSM tiles, branded coral/white pins, selection halo, attribution, and zoom/pan bounds.
* **Filtering & Categorization:** Region segmented control (**Zanzibar** – 7 destinations, **Mainland** – 17 destinations) plus the **Near me** tab, interest categories, keyword search, and a saved-favorites toggle. Filters compose (`src/features/explore/explore-model.ts`).
* **Detail Sheets:** Destination information, verified photography, image provenance, related day trips, packages, and local food/event highlights.

### 3.2 Near Me (Nearby Feature — New in v1.1.0)
* **Approximate Location Matching:** Evaluates user distance against the 24 destination coordinates using Haversine calculation on-device.
* **Privacy & Security Boundaries:**
  * Uses foreground coarse-only location (`ACCESS_COARSE_LOCATION` on Android, `NSLocationWhenInUseUsageDescription` with reduced accuracy on iOS).
  * No background location modes, no geofencing, no motion tracking.
  * Precise coordinates never leave the device—neither to analytics nor backend APIs.
  * Hardware requirement explicitly set to optional (`android.hardware.location` optional) so devices without GPS remain 100% compatible.
* **UI & States:** Explicit opt-in banner, locating/checking spinners, denial recovery, "Turn off" toggle, and manual map fallback.
* **Native configuration that must not regress** (`app.json`):
  * `expo-location` plugin: When-In-Use only, `NSLocationDefaultAccuracyReduced: true`, Always/background/foreground-service/motion all disabled.
  * `motionUsagePermission` string is set even though motion data is never read. Apple **rejected iOS build 5 (error 90683, missing `NSMotionUsageDescription`)** because `expo-location` links the motion framework; build 6 carries the string and was accepted.
  * `android.blockedPermissions` strips fine/background location, foreground-service location, activity recognition and legacy storage/overlay permissions.
  * Custom config plugin `plugins/with-optional-location-features.cjs` declares `android.hardware.location` (generic/network) as `required="false"`. Without it Google inferred GPS as required and dropped 1 phone / 5 tablets (code 6, never published); code 7/8 restore full coverage. A generated-manifest regression test guards this.
  * Android code 8 additionally links `com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE` via `expo-application` 57.0.2 / installreferrer 2.2. Source audit found no call to `getInstallReferrerAsync` and no attribution flow; it is present only because Settings reads version constants from `expo-application`.

### 3.3 AI Trip Planner Tab
* **Interactive Itinerary Generation:** Collects travel duration, guest count, safari interests, and beach preferences.
* **Consent Gates:** Explicit consent before querying the Anthropic-backed Netlify AI endpoint.
* **Quote Request Submission:** Submits structured itinerary drafts to `/api/planner-send` on `yournexttriptoparadise.com`. Never automatically retried on ambiguous network states to prevent duplicate submissions.
* **AI Reply Reports:** Users can flag an AI reply; reports go to `/api/planner-report` on the dedicated mobile Netlify site (probed GET → 405, invalid POST → 400; no live report email has been sent during QA).

### 3.4 Weather Tab
* **Live Zanzibar Conditions:** Temperature, humidity, UV index, wind speed, and condition code via Apple WeatherKit.
* **Animated Day/Night Weather Scene:** Respects device `Reduce Motion` settings; pauses ambient loop when backgrounded or off-tab.
* **12-Month Seasonal Guide:** Typical monthly temperature, editorial score and hotel season from the website's editorial guide; these are not live weather readings.

### 3.5 App Information & Settings (`/settings`)
* Dynamic version inspection via `expo-application` (displays true installed version `1.1.0` and build number).
* Direct links to live mobile privacy policy and web terms.
* Confirmed reset button to purge saved favorites and location preferences.

---

## 4. Current Build & Store Publication Status

### 4.1 Apple App Store & TestFlight
* **Account:** Louis Peter (`louisclarencepeters@gmail.com`)
* **Apple App ID:** `6809042574`
* **Bundle ID:** `com.yournexttriptoparadise.mobile`
* **Approved App Store Name:** `Destination Paradise Travel`
* **Native Display Name:** `Destination Paradise`
* **Latest Binary:** iOS `1.1.0 (6)` (IPA SHA-256: `24f4b89e8e760b565d355ecf5fad17bc3b335b7bb2d29060cdf710849adc3521`)
* **Status:**
  * Apple processing **Complete**.
  * TestFlight status: **Testing** in the owner-only internal group.
  * App Store Connect: Attached to saved `1.1.0` "Prepare for Submission" draft with Nearby release notes and reviewer notes.
  * Privacy Label: All 9 data categories published, linked to user, not used for tracking.
  * Owner TestFlight group holds one tester and three Testing builds (`6`, `4`, `3`). Rejected build `5` was never accepted.
  * **Latest recorded physical installation is `1.0.0 (4)`** (7 September, iPhone 15 Pro Max / iOS 26.6.1, 6 sessions, no crashes). Physical installation and functional QA of build `6` remain **unverified**; absence of verification does not prove it has never been installed.
  * Build history this cycle: `5` (Apple processing FAILED 90683) → `6` (accepted).

### 4.2 Google Play Console
* **Account:** Louis Peter (`louisclarencepeters@gmail.com`)
* **Play Console App ID:** `4972417635244765220`
* **Package Name:** `com.yournexttriptoparadise.mobile`
* **Listing Name:** `Destination Paradise Travel` (Saved & verified)
* **Latest Artifact:** Version `1.1.0`, Version Code `8` (AAB SHA-256: `43675893dad633ec2983ea3bfcaa535d894b82a5044ba46ca2a07211427459ba`)
* **Status:**
  * **Internal Release 5:** **Active / Available to internal testers / Not reviewed**.
  * Device Availability: **12,477 phones / 6,690 tablets** supported.
  * App Information Setup: Complete.
  * Data Safety: All 10 types/purposes saved.
  * IARC Rating: Completed (ESRB Everyone with alcohol reference; PEGI 3; Target Audience 18+).
  * Tester table: only **Destination Paradise owner test (1)** selected; the OutreachOS (15) and Rexona (17) lists are deliberately unchecked.
  * Version-code history this cycle: `6` held (device loss), `7` published as internal release 4 then superseded, `8` current. Owner installation of code 8 is unverified.

---

## 5. Verification & Test Evidence

All automated suites and build checks are green on the current workspace:

```bash
npm test            # 79/79 unit and integration tests passing
npm run typecheck   # Clean TypeScript typecheck (0 errors)
npm run content:check # 0 drift between web data and mobile generated-content.json
npx expo-doctor     # Clean Expo dependency and project check
npm run export      # Clean static production bundle export for all platforms
```

* **Test Coverage:** Validates distance calculation, destination ranking, boundary coordinate clamping, permission transitions, timeout/cancellation handling, persisted storage schemas, quote payload structure, generated native manifests, and fallback UI states.
* **Native QA actually performed (scope matters):**
  * **Android:** exact AAB-derived APKs for codes 6/7/8 on API 36 arm64 phone and tablet emulators (upgrade-in-place, cold launch, approximate-only permission dialog, denial/manual fallback, opt-out, persistence). A real coarse fix with Stone Town suggestions was obtained on code 6. Codes **6 and 7** share a byte-identical Hermes bundle; **code 8 has a different bundle**, while the five Nearby source files checked in its QA report match code 7. The GPS-success path was **not** repeated on code 8. Direct artifact hash verification is preserved with the [release evidence](release/evidence/2026-09-07-nearby/README.md).
  * **iOS build 6:** static bundle/version/orientation/entitlement inspection, strict deep code-signing check and local Apple archive validation only. No simulator or device runtime of build 6 is recorded. Earlier iOS runtime evidence comes from Expo Go and the 1.0.0 simulator build.
  * **Browser:** isolated Chromium checks of phone/tablet/landscape layouts, four Tanzania origins, denial/cancellation, and no coordinate leakage to network or storage.
* **Dependency audit:** `npm audit --omit=dev` reports **11 moderate** entries, all propagated from `uuid` inside Expo's Xcode tooling (dev-side; the affected `v3/v5/v6` paths are not called). Zero high/critical. No forced downgrade applied.
* **Backend:** `mobile/backend/` has `build`, `preflight` and `verify` scripts only. The 24 backend tests cited in `VALIDATION.md` live under root `test/netlify/` and run in the root website test suite; they are separate from the 79-test mobile suite. CI runs both suites explicitly.

### 5.1 Preserved release evidence

The release, source, artifact, signing, native-QA and store-distribution reports, plus selected screenshots, are preserved under **`mobile/release/evidence/2026-09-07-nearby/`**. Its [README and integrity index](release/evidence/2026-09-07-nearby/README.md) record original paths, hashes and any redactions. Historical reports retain original `/tmp` paths as provenance; use the indexed repository copies for a fresh session. Large signed binaries and credentials are not committed. The Play/Apple observations remain historical and are also summarised in `release/PUBLISH_STATUS.md`.

---

## 6. Action Items Before Public Store Launch

Before submitting for public review on either store, the following manual owner actions must be executed in the developer consoles:

### Repository — reconciliation completed
1. **Mobile history:** all ten mobile commits are retained on the reconciled `development` history, with the current remote website history preserved.
2. **Handoff and design:** this document and the existing design export are tracked.
3. **Release evidence:** compact reports and selected screenshots are preserved in the repository (see §5.1).
4. **Future website reconciliation:** the primary checkout's pre-existing website divergence and unfinished edits remain separate work. Use current `origin/development` for new shared work.

### Apple App Store Connect
1. **Verify Physical Device Installation:** Launch TestFlight on an iPhone/iPad, install build `1.1.0 (6)`, and confirm physical location prompt behavior.
2. **Set Country Availability:** In App Store Connect, select target distribution countries under **Pricing and Availability** (currently unset).
3. **Resolve EU DSA Declaration:** In Account Settings, confirm European Union Digital Services Act (DSA) trader/non-trader declaration status (account review currently in progress).
4. **Submit for Review:** Open version `1.1.0`, verify screenshots, and click **Add for Review** → **Submit to App Review**.

### Google Play Console
1. **Verify Physical Device Installation:** Open the [Internal Test Link](https://play.google.com/apps/internaltest/4701496308193764699) on an Android device and install code `8`.
2. **Submit Store Listing Changes for Review:** The updated navy logo, screenshots, and Data Safety declarations are saved in draft; click **Send for review** in the Publishing Overview.
3. **Conduct Closed Testing Track:** For Google Play accounts subject to the 14-day testing policy, invite a dedicated 12+ person tester group, run for 14 continuous days, and apply for production access.

---

## 7. Recommended Future Roadmap & Upgrades

Based on on-the-ground travel requirements in Tanzania, the following feature upgrades are recommended:

### Priority 1: In-Destination Travel Essentials
* **Offline Guide & Tile Caching:** Pre-bundle Stone Town walking maps, emergency contacts, and saved itineraries for use in remote national parks or coastal areas with poor mobile signal.
* **1-Tap WhatsApp Concierge:** Add a floating WhatsApp button with contextual payload (package ID, destination, or dates) to connect travellers directly with local coordinators in Zanzibar.
* **Tide Tables & Marine Weather:** Integrate Open-Meteo Marine or WorldTides API for high/low tide predictions and sea temperature in Paje, Kendwa, and Matemwe.

### Priority 2: Near Me (v1.1.0) Enhancements
* **Turn-by-Turn Navigation Handoff:** Provide a 1-tap "Directions" button that passes coordinates to Apple Maps or Google Maps.
* **Distance Radius Selector:** Add a toggle for "Walking (<2 km)" vs. "Island Drive (10–50 km)".

### Priority 3: Digital Itinerary & Booking Wallet
* **Client Itinerary Lookup:** Allow guests who booked via the website or staff quote to enter their reservation code and view their day-by-day itinerary, hotel vouchers, and driver pickup times offline.
* **Couples / Honeymoon Mode:** Tailored curation filter for honeymooners highlighting private sandbanks, candlelit beach dining, and secluded safari lodges.

### Priority 4: Map Engine Upgrade
* **MapLibre Native:** Replace Leaflet WebView with native `@maplibre/maplibre-react-native` for 60/120 FPS hardware acceleration, gesture responsiveness, and offline vector tile packages.

---

## 8. Key Reference Paths & Artifacts

* **Source Code:** `mobile/src/`
* **Routing & Screens:** `mobile/app/`
* **Generated Content & Sync Script:** `mobile/src/data/generated-content.json`, `mobile/scripts/sync-content.mjs`
* **Testing & Validation Log:** `mobile/VALIDATION.md`
* **Detailed Store Publishing Log:** `mobile/release/PUBLISH_STATUS.md`
* **Store Review Notes:** `mobile/release/review-notes.md` (the app has no login; no credentials are stored anywhere in the repo)
* **Data Safety Answers:** `mobile/release/store-privacy-answers.md`
* **Mobile Privacy Policy (Live):** `https://destination-paradise-mobile.netlify.app/mobile-privacy.html` (source: `mobile/release/mobile-privacy.html`)
* **Privacy Data-Flow Worksheet:** `mobile/release/privacy-data-flow.md`
* **Native Config Plugin (optional location hardware):** `mobile/plugins/with-optional-location-features.cjs`
* **EAS Config:** `mobile/eas.json` — `appVersionSource: remote`, `autoIncrement: true` on the `production` profile; build numbers are assigned by EAS, not `app.json`
* **Mobile Backend (Netlify functions for weather / marine / reports / privacy page):** `mobile/backend/` — site `destination-paradise-mobile`, site ID `f0fa9f3a-0de9-4e62-9809-d64031c415a2`
* **Agent Instructions:** `mobile/AGENTS.md` (loaded by `mobile/CLAUDE.md`)
* **Design Source (tracked Claude Design export):** `design/mobile-app/` — `README.md` links the interactive prototype; this is a historical design export, separate from the Expo app
* **Website Handoffs (context for the shared repo):** `PROJECT_ISSUES_HANDOFF.md` (release/CI state, branch-reconciliation rule), `HANDOFF.md` (store/booking phases)
