# Store release preparation

Local review drafts, prepared 5 September 2026 from the mobile source and its Netlify services, including the existing website APIs. These files have not been submitted to a store and do not establish store approval, provider contracts or legal ownership.

- [Listing copy and account fields](listing.en.json)
- [Review notes](review-notes.md)
- [Privacy data flows and declaration worksheet](privacy-data-flow.md)
- [Published mobile privacy source](mobile-privacy.html), verified live on the dedicated mobile site
- [Screenshot and asset plan](assets.md)

## Verified release status — 5 September 2026, 21:00 UTC

Mobile tests passed **47/47**, backend tests **24/24**; typecheck, all-platform exports and a clean EAS archive install passed. The Router decoder fix is a licensed CommonJS adaptation of upstream 0.5.0; effective Android permissions are `INTERNET` and `VIBRATE`. Detailed evidence and remaining native QA are recorded in [VALIDATION.md](../VALIDATION.md). The [source fingerprint manifest](build-source-sha256.json) is preserved.

Dedicated mobile deployment `6a9c808c5bf2edc8e8dfa90a` is live. Weather returned HTTP 200 with Apple observation `2026-09-05T20:51:08Z` (23.63 °C, humidity 0.86, `MostlyClear`); marine returned HTTP 200 with `null` / `Unavailable`. Report GET returned 405 and invalid POST returned 400 without sending email. The [mobile privacy page](https://destination-paradise-mobile.netlify.app/mobile-privacy.html) returned HTTP 200 with SHA-1 `7e39c40421544ad0ffc1f402670e2143f6d711e7`, matching the source. The main website's published deployment remained `6a8dbf35cb01b33e235abc4b`.

iOS Simulator build `e9a5dd2a-d500-4daa-a32e-8fea7de77472` is **FINISHED**; its artifact was downloaded and the standalone bundle `com.yournexttriptoparadise.mobile` installed on iPhone 17 Pro and iPad Pro 11-inch (M5). Phone Explore showed real OSM tiles and seven Zanzibar pins; iPad landscape showed the map/sidebar and Paje details. Both showed the live Apple reading rounded to 24 °C, `MostlyClear`, humidity 86%, sea unavailable and source time 20:51:08 UTC; iPad used two columns. Apple logo/legal attribution and phone Pause → Play → Pause were checked. Browser Weather matched the production values and Pause/Play worked.

iPad landscape-to-portrait rotation preserved correct weather, the two-column layout and bottom tabs without overflow. The compiled standalone `Info.plist` confirms version `1.0.0`, build `1`, minimum iOS `16.4`, phone/tablet families `[1,2]`, all four orientations, ATS arbitrary loads disabled, local networking enabled and non-exempt encryption `false`.

Android production build `29c21f3e-68d3-4b02-b02a-6b12c2bd566d` remained `IN_PROGRESS` in its last supplied snapshot. The Simulator build cannot be submitted to the App Store. Final store assets, physical-device and Android visual/keyboard/gesture checks remain open. Stores have not been submitted, and the publisher answer remains pending. WeatherKit uses the existing membership allowance; no Open-Meteo purchase or new weather subscription was made.

## Concrete release gates

| Gate | Evidence at this audit | Work to close it |
| --- | --- | --- |
| AI reply reporting | `Report reply`, its reviewed consent-based modal and the endpoint are implemented and deployed. Live GET/invalid POST probes returned 405/400 without email. Provider-accepted success is covered by mocked tests. | Verify the final native interaction and controlled operational delivery, and maintain report review. Invalid-request probes and mocked tests do not establish production receipt. [Google policy](https://support.google.com/googleplay/android-developer/answer/13985936?hl=en-GB) |
| AI safety handling | The audited server prompt scopes advice to travel and prohibits invented availability. No dedicated app-level restricted-content filter was found. The new report endpoint gives the team material for review. | Verify effective provider/app safeguards with harmful and off-topic prompts, add controls where needed, and use reports to improve them. Record what the production AI provider handles versus what the app enforces. Do not claim an untested filter. |
| Mobile privacy coverage | The mobile policy is published at `https://destination-paradise-mobile.netlify.app/mobile-privacy.html`; HTTP 200 and source-matching SHA-1 were verified. App configuration and listing drafts use this URL. | Confirm the link in the final native candidate and use it in the store forms. Publishing the policy does not complete account-specific privacy declarations. |
| WeatherKit deployment | The production endpoint returned HTTP 200 with the original Apple observation time. Standalone iPhone/iPad Simulator apps and browser displayed matching production values; native/browser Pause/Play worked. | Complete release-device and offline/recovery checks, retain official Apple attribution and monitor the included allowance. No new weather purchase or public-provider fallback is part of this release. |
| Privacy declarations | Name/email/optional phone, AI messages, trip context and quoted transcript leave the device. Email records persist; upstream retention and Sentry configuration were not verified. | Complete the worksheet with actual provider settings. Do not select “no data collected” or “ephemeral only” without supporting evidence. |
| Final native QA | The finished standalone iOS Simulator artifact passed the observed phone/tablet map, Paje-detail, production-weather and pause/play checks. Earlier Expo Go interactions and Android launch logs are separately recorded in `../VALIDATION.md`. | Finish store-candidate QA, Android visual/keyboard/gesture checks and physical-device touch gestures. Check external links, consent, reporting and offline recovery in final artifacts. Keep email tests controlled. |
| Store assets | App icons exist. No store screenshot set or feature graphic existed in this release directory when audited. | Capture final native screens and produce the assets in `assets.md`; do not submit browser chrome or Expo Go screens as release UI. |
| Identity and store forms | Review contact, legal publisher/copyright holder, regional distribution, content rating and provider retention cannot be established from source. | Use the verified store-account owner and actual operations contact. Root handles accounts, agreements, signing and submission. |

Existing AI consent is a positive finding: the planner explicitly names Destination Paradise and Anthropic, with an unchecked choice and a code guard before requests. Quote sharing has a separate review/consent step. Preserve both. Apple requires disclosure and affirmative permission before third-party AI receives personal information. [Apple review guidelines, 5.1.2](https://developer.apple.com/app-store/review/guidelines/#data-use-and-sharing)

## Build and operational notes

The dedicated mobile Netlify site is `destination-paradise-mobile` (site ID `f0fa9f3a-0de9-4e62-9809-d64031c415a2`). Weather (`/api/weather`), AI reply reports (`/api/planner-report`) and the public mobile privacy page use `https://destination-paradise-mobile.netlify.app`; live verification is recorded above. Planner chat (`/api/planner`) and quote sending (`/api/planner-send`) continue to use `https://yournexttriptoparadise.com`, alongside website marketing, travel-product, photo and support links.

The four task-created WeatherKit settings were removed from the old website site (DELETE 204, subsequent GET 404). Both sites' published deployment IDs remained unchanged. An unused draft could not be deleted (405) and was left unpublished; it is not a production deployment.

Current source config uses version `1.0.0`, identifiers `com.yournexttriptoparadise.mobile`, tablet support and both orientations. SDK 57 documents iOS 16.4+, Android 7+, API target 36 and Xcode 26.4+. Confirm the generated candidate rather than treating Expo Go as the signed app. [Exact Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)

Inspect the final merged Android manifest and iOS privacy manifests for actual permissions/required-reason APIs. The app code does not request GPS, camera, microphone, contacts, photos or ad tracking. Development tooling and transitive native packages are not proof of the release permission set.

OSM tiles are permitted for ordinary interactive viewing with attribution, app identification and normal caching. Source contains all three mechanisms and no bulk/offline download feature; verify actual release WebView requests and caching. Public tiles have no availability guarantee, so maintain the list fallback and a provider migration plan. [OSMF tile policy](https://operations.osmfoundation.org/policies/tiles/)

## Facts that still require owner/account evidence

- Legal store publisher/copyright holder and the full named App Review contact. The public page uses the same verified Destination Paradise brand, Zanzibar location and support email as the website; it does not invent a registered company name or street address.
- Reachability and ownership of the team/privacy mailbox and the operational process for handling reports and privacy requests.
- Provider contracts, processing regions, actual retention and any zero-retention arrangements. The public page uses purpose-based retention criteria already reflected in the website policy and does not promise fixed deletion deadlines or a no-training arrangement.
- Store territories, pricing, audience/content-rating answers and promotional image rights/provenance. Root has verified Apple WeatherKit account access under the existing membership allowance. Keep its team/service/key credentials on the server and monitor the included allowance. No new weather purchase is authorized.

The published mobile policy has no draft banner or unfilled fields. These internal questions still matter for account/store declarations; they should not be answered by assumption. Update this snapshot after later build and account work. Open gates here are not a claim that a later release change is still blocked.

The published privacy page describes the deployed WeatherKit flow. WeatherKit does not supply sea-surface temperature, so the app and store assets must show that field as unavailable or omit it rather than reuse an old marine reading.

Weather implementation evidence: the mobile app makes one forecast request to `/api/weather`, uses the source `asOf` time, and makes no marine request. The server forwards only fixed coordinates and its own authorization; it does not forward incoming client headers. Successful public weather responses use a 60-second HTTP client cache and a 600-second durable CDN cache with 60 seconds of stale revalidation. The official Apple Weather PNG is bundled, so displaying it causes no direct app-to-Apple asset request. Live production returned observation `2026-09-05T20:51:08Z`, which was also observed in the standalone iOS Simulator app.
