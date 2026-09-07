# Destination Paradise — publishing status

## Nearby feature — 7 September 2026

The optional **Near me** update is now in private testing. iOS **`1.1.0 (6)`** is **Complete** at Apple and **Testing** in the existing owner TestFlight group. Android **`1.1.0 (8)`** is published as internal release **`5`**, **Active / Available to internal testers / Not reviewed**, released **7 September 2026 at 18:43 EAT**. Both audiences remain the existing one-person owner group. Public store release is pending.

The user approved marketing version **`1.1.0`**. Settings now reads the actual installed native version/build instead of hardcoded text; Android phone/tablet screenshots show **`1.1.0 (8)`**. Signed iOS 6 contains the corrected Motion purpose string and Apple accepted it; the app does not use motion data. Android location remains coarse-only and optional; the additional unused Install Referrer binding is audited below.

The latest authenticated owner-device evidence remains **Installed `1.0.0 (4)`**, dated **7 September**, on **iPhone 15 Pro Max / iOS 26.6.1**, with **6 sessions and no reported crashes**. The owner TestFlight group now has one tester and three Testing builds (`6`, `4`, `3`); rejected build `5` was never accepted. New build 6/code8 physical installations remain unverified.

The App Store **1.1.0 Prepare for Submission** draft has the Nearby description, reviewer notes and accepted **build 6** saved. After returning from TestFlight, version 1.1.0/build6 and disabled Save persisted. Only build 4’s draft attachment was replaced; old TestFlight access remains. No Add for Review was clicked. Android internal release 5 notes were published with code 8.

Users first opt in to approximate foreground location, then receive ranked tours and destinations from the bundled catalogue. Suggestions refresh on a new session or foreground return while enabled; manual browsing, refresh and turn-off remain available. Coordinates stay in memory on the device. Nearby photos are bundled and the map opens only after an explicit destination selection; Planner receives only the chosen destination ID.

Current source validation: **79/79 tests and typecheck passed**. Earlier Nearby iOS/Android/web production exports passed. Isolated Chromium checked phone, tablet and short landscape layouts, four Tanzania origins, outside-coverage/denial/cancellation, filtering, settings, persistence and destination-to-Planner transfer, with no console errors or origin-coordinate network/storage leakage observed. Android Expo Go phone/tablet checks passed permission, denial, services-off, timeout/cancel, foreground refresh, persistence and disable. An initial Expo Go coarse acquisition did not resolve. The later exact code `6` AAB-derived app obtained a normal emulator fix after refresh and displayed Stone Town recommendations, repeated after a force-stop/cold relaunch. Its actual approximate-only permission dialog, portrait search/keyboard focus, denial/manual fallback, opt-out and cold persistence passed with zero app warnings/errors. Physical-device acquisition remains unverified.

Current `1.1.0` runtime commit: **`2b92765c`** on `development`. The new EAS source archive contains **111 files / 4,890,284 bytes**; all 111 files matched the frozen workspace after both cloud build uploads. The source freeze is `/tmp/dp-version-110-source-manifest.json`.

Initial Nearby implementation commit: `04e6eb30` on `development` (local; no push or PR). Its historical EAS archive contained **108 files / 4,885,037 bytes**, all matching the frozen workspace source before and after those cloud uploads. It excluded credentials, backend, release records, dependency trees and generated native projects. Those candidates used existing remote credentials with no automatic submission; iOS build `5` was subsequently uploaded without automatic TestFlight setup:

| Candidate | EAS build | Current stage |
| --- | --- | --- |
| iOS `1.0.0 (5)` | `e6c3bbd7-a328-4de1-9151-3b3da6162c64` | EAS build and upload FINISHED; submission `133ac304-be96-4a3a-8e0d-0cc96deaf9e2` finished at `2026-09-07T11:50:39.181Z`. **Apple processing FAILED — 90683, missing `NSMotionUsageDescription`**; not accepted or assigned to TestFlight |
| Android `1.0.0 (6)` | `f2bfbbcc-3902-4850-be1c-517e533ae72f` | FINISHED at `2026-09-07T11:55:15.512Z`; held and removed from draft release `4`, **never published**: superseded by code `7` to retain six device models |
| Android `1.0.0 (7)` | `ae4d6007-7317-4cc3-a41d-44682aa5b871` | FINISHED at `2026-09-07T12:25:19.076Z`; exact artifact/native gates passed; published as **internal release `4`**, **Active / Available to internal testers / Not reviewed**, 15:34 EAT |
| Android `1.1.0 (8)` | `869ab4bf-ae37-4b84-9a92-45671c95bacd` | **FINISHED** `2026-09-07T15:34:53.417Z`; artifact/native QA passed; **internal release 5 published**, Active / Available to internal testers / Not reviewed, 18:43 EAT |
| iOS `1.1.0 (6)` | `d439b36e-da24-4ab6-a3b9-2d3d9114df56` | Build **FINISHED** `2026-09-07T15:05:02.353Z`; artifact/signing passed. Original EAS submission `2e39c349-c95e-4871-ae2c-5133f81385f7` **FINISHED** `2026-09-07T15:29:14.373Z`. Apple **Complete**, existing owner group **Testing**, App Store 1.1.0 draft build 6 saved |

iOS `1.1.0 (6)` actual IPA: **26,285,441 bytes**, SHA-256 `24f4b89e8e760b565d355ecf5fad17bc3b335b7bb2d29060cdf710849adc3521`. Bundle/version/build, phone/tablet orientations, When In Use/reduced accuracy, corrected Motion purpose, no Always/tracking/background modes and strict deep code signing passed. Local Apple validation returned “No errors validating archive.” The original EAS upload finished while that validation ran, so it was **not cancelled** and **no direct duplicate upload occurred**. The temporary local key/metadata directory was removed; the existing server key was unchanged and no key was created. Redacted evidence: `/tmp/dp-native-release/version110-ios-build6-submission-verification.json`, plus the corresponding artifact/signing verification files. Fresh App Store Connect shows upload `5d8d6831-9fdf-4e2c-89b8-a22442e54353`, displayed **7 September, 6:29 PM EAT**, **Complete**. Root separately verified the existing one-person owner group shows build 6 **Testing**, and saved the TestFlight notes. The App Store 1.1.0 draft attachment persisted after navigation. Evidence: `/tmp/dp-native-release/version110-apple-processing-and-distribution.json`. New owner installation and App Review remain pending.

The updated [mobile privacy policy](https://destination-paradise-mobile.netlify.app/mobile-privacy.html) is live on dedicated deployment `6a9ea3bf9044dfcb528cdd62`. Canonical and immutable responses both matched source SHA-256 `1ce162735435379f5972bd7ead12cbcbfc4eb111529b4ad84680d9f448843788`. All three mobile functions were preserved and the main website deployment remained `6a8dbf35cb01b33e235abc4b`. Weather returned 200, marine 200 with an honest null reading, and the report endpoint returned expected GET 405 / OPTIONS 204. No message was sent or environment value changed. After renewed App Store Connect sign-in, the processing failure was verified and iOS build `4` remained assigned to the owner group. Android code `7` was the previous private release, now superseded by code 8. Owner installation of the new builds and a public store release are not established; rejected iOS build `5` cannot be installed through TestFlight.

iOS build `5` completed at `2026-09-07T11:48:14.827Z`. The 26,268,155-byte IPA SHA-256 is `f9aae1fa93d2f187a0faedf5083b8367c97bea573713d7ba0cc024b490581050`. Strict deep code signing and static bundle/version/device/orientation checks passed. It contains When In Use location permission and default reduced accuracy, with no Always, Motion, tracking description or background mode. The missing Motion purpose string caused Apple's later rejection: authenticated App Store Connect showed upload `36a4d65b-0312-403e-a117-5535e3203733`, displayed 7 September at 2:50 PM, **Failed**, error **90683**, missing `NSMotionUsageDescription`. EAS upload completion was true but did not establish Apple acceptance. The correction is now verified in signed build `6`, whose accepted processing and owner-group Testing state are recorded above. Static checks do not establish physical-device location acquisition.

Android code `6` AAB: 80,959,092 bytes, SHA-256 `68337eee1b7d6945c49f583070d3c8683740a9e0d9e74d510a05bf6073ce6dd6`. Bundle identity and coarse-only/no-background permissions passed. Google inferred `android.hardware.location` as required from the coarse permission because the manifest lacked an explicit optional feature declaration. Play preview showed one phone and five tablets lost (12,476 phones / 6,685 tablets), so publication was held for a compatibility correction. No tester has been offered code `6` by this task. The correction in local commit `cc6b32c1` declares generic/network location hardware optional. Expo introspection proved all iOS native output and every other Android setting unchanged. The code `7` upload archive contained **110 files / 4,887,930 bytes**, matching the frozen workspace; it includes a generated-manifest regression test.

Android code `7` exact AAB: **80,959,187 bytes**, SHA-256 `84f3f55f838cb319dde330dd0ea8193fedec7b69a00e427c5160f6c41fc8d4ea`. Generic/network location features are explicitly optional, and `aapt2` confirms the only required feature is the unchanged `android.hardware.faketouch`. The package remains coarse-only, with no fine/background location, motion, overlay or storage permissions; debuggable and cleartext flags remain false.

The code `7` AAB-derived app passed phone/tablet upgrades, preserved data, cold launches, approximate-only permission UI, denial/manual map fallback, permanent-denial recovery and zero app warnings/errors. The phone emulator returned timeout/unavailable with correct recovery during its bounded code `7` lookup; no further retries were used to manufacture success. Its compiled Hermes bundle is byte-identical to code `6` (`ec5e3a7396735a2b94903fda93ca24b5bd1616ea8e1c98c6c642ee165652f5ec`), whose real native Stone Town acquisition and relaunch refresh passed. Physical-device and Play-delivered installation checks remain separate. The bounded code `7` QA report is `/tmp/dp-native-release/nearby-code7-native-qa.json` (11 native captures). Both dedicated emulators were stopped after restoring orientation/location settings, disabling Nearby and resetting permissions; existing app data was preserved.

Google Play accepted the exact hash-verified code `7` AAB and restored **12,477 phones / 6,690 tablets**, with **zero devices lost** across every form factor. Only the pre-existing nonblocking deobfuscation warning remained. Root completed both Save and publish confirmations and verified the fresh active release. Google states propagation usually takes an hour and can take longer. The internal join URL remains [the existing private test](https://play.google.com/apps/internaltest/4701496308193764699); the post-publication Testers table confirms only **Destination Paradise owner test (1)** selected, with OutreachOS Closed Testers (15) and Rexona Testers Jul 2026 (17) unchecked and Save disabled. No additional tester list or public production track was enabled.

Android **1.1.0 (8)** exact AAB: **80,969,254 bytes**, SHA-256 `43675893dad633ec2983ea3bfcaa535d894b82a5044ba46ca2a07211427459ba`. Both phone/tablet upgrades retained data, cold launches passed, Settings visibly showed 1.1.0 (8), and approximate-only permission/denial/manual-map recovery passed with zero app errors. Nearby source files match code 7; GPS-success flow was not repeated on code 8. Dedicated emulators were stopped and permissions reset. Evidence: `/tmp/dp-native-release/nearby-code8-native-qa.json`, `nearby-code8-local-apk-verification.json` and `nearby-code8-cleanup.json` in the same directory.

Android code 8 adds com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE through expo-application 57.0.2 and installreferrer 2.2. The native client connects only from explicit getInstallReferrerAsync; no app call exists, Settings reads version constants only, and provider/service/receiver components are unchanged. No automatic attribution flow was found; this was a source/component audit, not a complete network capture.

Google Play accepted the exact code 8 artifact. The release preview confirmed **12,477 phones / 6,690 tablets**, zero devices lost, no errors and only the nonblocking missing-deobfuscation-file warning. After both publication confirmations, the fresh track showed release 5 **Active / Available to internal testers / Not reviewed** at 18:43 EAT. The tester table retained only **Destination Paradise owner test (1)**, with other lists unchecked and Save disabled. Evidence: `/tmp/dp-native-release/version110-android-play-distribution.json`. The existing private join URL is unchanged; store propagation and owner installation remain separate from publication.

## Previous private release — navy icon

The historical snapshots below predate the current `1.1.0` private releases and the newly verified owner installation of iOS build `4`, recorded above.

Previous navy-icon reconciliation: **6 September 2026, 23:14 EAT**, after root confirmed Android navy-icon code `5` published as internal release `3`. iOS navy-icon build `4` is processed, assigned to the owner group and **Testing**, and saved for the App Store version. Root also refreshed the tester page and verified the owner's installation of prior iOS build `3`. Store UI and invitation-receipt facts came from root's authenticated App Store Connect / Play Console and Gmail checks; artifact and EAS completion evidence are recorded separately.

**Public app-store launch is not complete.** The navy-icon iOS build `4` is uploaded, processed and **Testing** in the owner-only TestFlight group; its installation is not yet verified. The owner has installed prior build `3` on an iPhone 15 Pro Max running iOS 26.6.1, resolving the earlier invitation/install blocker for that build. Android navy-icon code `5` is published as active owner-only internal release `3`, **Available to internal testers** and **Not reviewed**, released at **23:14 EAT**. Its exact AAB passed bounded launcher/splash/cold-launch phone/tablet QA. Google noted device availability can take an hour or more; owner installation remains unverified.

**Destination Paradise Travel** is saved in both stores, and the new full-logo navy icon is saved in the Google Play default listing. The AI declaration selects App icon and Feature graphic; native screenshots remain unchecked. Google's listing and all ten Data Safety types are saved, with app-information setup complete. Saved changes await **Send for review**, which has not been clicked. The nine-category Apple privacy label is published. The installed app name remains Destination Paradise. Navy-icon build `4` is saved for App Store version `1.0.0` and its selection persists after navigation; no final App Review was submitted.

## iOS / iPadOS

| Item | Verified state |
| --- | --- |
| Publishing account | Existing Louis Peter account accepted by the user |
| Apple app ID | `6809042574` |
| Bundle ID | `com.yournexttriptoparadise.mobile` |
| Store version | `1.1.0` — Prepare for Submission draft saved; no public review |
| App Store name | **Destination Paradise Travel — saved and verified after navigation.** Root confirmed the Saved indicator, navigated to the version and back to App Information, and verified the name remained. Fresh App Information again shows the exact approved Name and unchanged subtitle; its cached top header still showed the older Zanzibar name. Native display name remains `Destination Paradise`. |
| Previous signed EAS build | `62008916-18a2-45f0-a27a-77deabe2041f` — `FINISHED`, version `1.0.0`, build `2`; build completed `2026-09-05T21:20:40.451Z` |
| Previous EAS submission | `2e21faa5-43e8-43ec-893c-1fe82153a5b2` — **`FINISHED`**, created `2026-09-05T21:33:01.598Z`, completed `2026-09-05T21:33:15.960Z`, no error code |
| Previous build 2 processing | Root verified build `2` as **Ready to Submit**, expires in 90 days, with `0/–` invites displayed. This does not establish any tester has been invited or installed it. |
| Corrected cloud build | `a8eb3b90-eb2c-4f2d-a6fb-1fd3507bf876` — **`FINISHED`**, version `1.0.0`, build `3`; created `2026-09-05T21:49:13.404Z`, completed `2026-09-05T21:54:49.192Z`. |
| Corrected IPA inspection | Actual 21,380,138-byte IPA verified; identity, device families, orientations, ATS and privacy manifest summary are below. |
| Corrected EAS submission | `c48ecd45-1469-4f70-a552-67b58c6162cf` — **`FINISHED`**, created `2026-09-05T21:58:26.273Z`, completed `2026-09-05T21:58:39.696Z`, no error code. Exact build `3`, ASC app `6809042574`; no automatic TestFlight group setup or App Review. |
| Corrected build 3 / owner installation | Build `1.0.0 (3)` remains **Testing**. After navigating away and back, root verified owner `louisclarencepeters@gmail.com` as **Installed 1.0.0 (3)**, dated 6 September 2026, on **iPhone 15 Pro Max / iOS 26.6.1**. The earlier Invited display was cached. This establishes acceptance and installation of build `3`, not installation or functional QA of build `4`. |
| Owner invitation recovery | Owner screenshot showed an invalid/revoked invitation. Root completed **Reinvite → Resend** for the existing owner, and Gmail confirmed receipt at `2026-09-06T19:26:27Z` (**22:26 EAT**). No tester was removed and memberships/access were unchanged. The later **Installed 1.0.0 (3)** state resolves the invitation/install blocker for build `3`; the original error's cause remains unproven. |
| Navy-icon build 4 | EAS `4a785994-db2c-40fc-9329-a296e584ec15` **FINISHED** at `2026-09-06T19:57:58.628Z`; submission `f44a111f-8f11-491e-b39c-8d156e6c0f65` **FINISHED** at `2026-09-06T20:01:01.642Z`. Actual IPA SHA-256 `31ef588f37267c0fea9635ca887702aad16a0a8cb8f8e2111d94a5c6e513dd9f`; static identity/device/privacy checks passed and the compiled full navy logo was visually verified. |
| Navy-icon build 4 / TestFlight | Apple upload is **Complete**, ASC build `baaed647-bc09-465e-9f15-52d9387b16ba`. Root manually assigned the existing **Destination Paradise owner test** group (`0db9334b-5e79-4fa1-8950-e0e782456ba8`) after EAS did not assign it automatically. The group shows **1 tester / 2 builds**, including **1.0.0 (4) Testing**, expires in 90 days. Automatic distribution remains off. What to Test was saved with a Saved indicator. Build `4` installation is unverified. |
| App Store version build selection | **1.1.0 build 6 saved and verified after navigation.** Nearby description/reviewer notes persisted and Save was disabled. Prepare for Submission; Add for Review not clicked. Historical build 4 selection is recorded above. |
| Final App Review | Not submitted; DSA choice, country availability and remaining release-device/service QA are open |
| Screenshots | Three JPEGs uploaded in iPhone 6.9-inch and three in iPad 13-inch sets; Apple showed `3 of 10` for each with automatic scaling |
| Listing copy / review notes | Saved in App Store Connect |
| Subtitle / category | `Zanzibar & Tanzania trip guide` / `Travel` — saved |
| Third-party content rights | Yes — saved in Apple |
| Age rating | Calculated **13+**, saved without override. Questionnaire: no features selected; infrequent alcohol/bar references; other content none. |
| Apple privacy | All **nine data types published by Louis Peter**; linked to user, not tracking. Exact purposes are listed below. |
| Support / marketing / privacy URLs | Saved in Apple; privacy page itself is already publicly hosted. |
| Price | Base **USD $0**, with 175 zero-price equivalents saved. This does not establish country availability. |
| Platform availability | Mac and Apple Vision Pro availability unchecked, matching the requested phone/tablet scope. Public distribution remains the default. |
| App Availability countries | **Unset**; still needs selection and saving. |
| Copyright | `2026 Destination Paradise` |
| Reviewer contact entered | Louis Peter · `louisclarencepeters@gmail.com` · `+255768779517` (public business support phone). Visually confirmed in the screenshot despite accessibility-text redaction. |
| Review sign-in | No sign-in required |
| Submission credentials | Existing ASC API key `AXPG36FM4F` assigned to EAS servers. No secret/key download was performed for the status check. |
| DSA / trader status | App currently has the non-trader default. Existing account trader review is **In Review**, dated 5 September. User decision pending: reuse existing trader details or provide different business details. No private address is recorded here. |

The iOS status was obtained through installed **EAS CLI 23.2.0**, after confirming command help and the official CLI implementation:

```text
eas submit:view 2e21faa5-43e8-43ec-893c-1fe82153a5b2 --json
```

Only submission/build IDs, states, version, timestamps and error-code presence were retained. A redacted snapshot is at `/tmp/dp-ios-submission-status-20260906.json`. `submit:status` was not used because its App Store Connect lookup resolves local API credentials; this review was limited to submission metadata and did not retrieve key material.

## Android

| Item | Verified store-UI state supplied by root |
| --- | --- |
| Publishing account | Existing Louis Peter account accepted by the user |
| Play Console app ID | `4972417635244765220` |
| Package | `com.yournexttriptoparadise.mobile` |
| Play listing name | **Destination Paradise Travel — final save verified.** Changes saved and the saved-change modal confirmed the final Review Save; the dashboard displayed the new name. Send for review remains pending. |
| Accepted AAB | **Version `1.0.0`, version code `5`**, min SDK 24, target SDK 36. Exact AAB SHA-256 `c067fea9c268bb27359bea2ea9ffbc53582e62e81e5114b4440cf5efe3c93026` matches the icon-QA artifact. Native debug symbols attached. |
| Internal release | **Release `3`: `1.0.0 (5) — full-logo navy icon`**, code `5`, **Available to internal testers**, **Not reviewed**. Root completed Save and publish and the explicit confirmation. Fresh track shows **Active**, released **6 September, 23:14 EAT**. Details path ends `/releases/3/details`. |
| Internal track | `4701496308193764699` — **Active** |
| Internal track app label | Still displays temporary **`com.yournexttriptoparadise.mobile (unreviewed)`** until app review. The saved Destination Paradise Travel listing name is separately verified. |
| Internal join URL | `https://play.google.com/apps/internaltest/4701496308193764699` |
| Saved internal testers | Fresh Testers tab verified only **Destination Paradise owner test (1)** selected, owner `louisclarencepeters@gmail.com`; OutreachOS (15) and Rexona (17) unchecked; Save disabled. Owner opt-in/installation is not verified. |
| Previous weather-correction build | `d5ad03c9-bca0-4d33-9ba5-2c9cebe89260` — **`FINISHED`** at `2026-09-05T22:03:13Z`, version `1.0.0`, code `4`; created `2026-09-05T21:48:49.283Z`. Exact-artifact standalone phone/tablet regression **passed**. Its historical internal release `2` is superseded by navy-icon release `3`/code `5`. |
| Navy-icon build 5 / artifact | EAS `4106b3fe-467d-4769-b407-fe107d5ca526` **FINISHED** at `2026-09-06T20:06:35.329Z`. Actual 78,159,005-byte AAB SHA-256 `c067fea9c268bb27359bea2ea9ffbc53582e62e81e5114b4440cf5efe3c93026`; bundletool validation passed. Package, min SDK 24 / target 36, permissions and security flags are unchanged from code `4`. |
| Navy-icon build 5 / QA and publication | Exact-AAB-derived APK passed native launcher, splash and cold Explore launch checks on phone/tablet emulators with zero app errors; root also reviewed phone launcher and tablet splash captures. Play accepted the exact AAB and root published internal release `3`. Review showed only the nonblocking missing-deobfuscation warning; 12,477 supported phones and 6,690 tablets, no devices lost. [Publication evidence](icon-review/android-internal-release-verification.json). Device propagation may take an hour or more; owner installation remains unverified. |
| Google listing | New name, copy, full-logo navy icon, feature graphic and three images in each phone/seven-inch/large-tablet set are **saved and verified**. Root verified the navy thumbnail and Change saved confirmation. The saved AI declaration selects App icon and Feature graphic, with native screenshots unchecked. Saved changes await Send for review; no published listing is claimed. |
| Seven-inch screenshots | **Three authentic 1200×1920 native captures uploaded and final save verified.** Next/Review shows all three screenshot sets at three images each. [Capture evidence](assets/android/tablet-7/capture-manifest.json). |
| App-information setup | **Complete, verified.** After Data Safety saved, the dashboard removed the setup checklist and closed-test setup lock. No numeric 11/11 count was displayed; the earlier 10/11 is historical. |
| IARC content rating | **Completed/saved** 6 September, 01:28 EAT. ESRB Everyone (Alcohol Reference), PEGI 3, USK All ages, ClassInd All ages, Generic 3+. Downloaded-content alcohol references Rarely; other downloaded categories No; online content Yes (AI), online age categories No; miscellaneous No. |
| Target audience | **18 and over — saved.** This is separate from calculated IARC age ratings. |
| Google Data Safety | **All ten types/purposes saved and verified.** The fresh form was blank after the earlier failed save; root restored the exact worksheet answers, verified the preview, and saved. Changes saved / Send for review appeared; modal Save and Save Draft were disabled. Not yet sent for review or published. |
| Current Play Console access | **Accessible and verified.** Version1.1.0 (8) is published on the internal track; pending listing/Data Safety Send for review remains separate. |
| Closed testers | A **separate Destination Paradise list** is expected from the user. Do not reuse the OutreachOS 15-person list. |
| Closed-test production gate | Setup is now unlocked, but no qualifying closed test is established or completed. Internal testing does not satisfy the requirement. |
| Public production release | Not published |

For applicable new personal Play accounts, Google requires at least **12 testers continuously opted into a closed test for 14 days**, followed by a production-access application. Meeting the count/duration is not itself production approval. No qualifying closed-test start date, 12-person opted-in count or completed duration has been verified for Destination Paradise. [Google's current testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465).

## Published Apple privacy label

All nine categories are **linked to the user** and **not used for tracking**. The root task verified these exact configured purposes in Apple:

| Category | Saved purpose(s) |
| --- | --- |
| Name | App Functionality |
| Email Address | App Functionality |
| Phone Number | App Functionality |
| Coarse Location | App Functionality; Analytics |
| Customer Support | App Functionality |
| Other User Content | App Functionality; Product Personalization |
| Product Interaction | App Functionality; Analytics |
| Other Diagnostic Data | App Functionality |
| Other Data Types | App Functionality; Product Personalization |

The privacy URLs are saved and **Louis Peter published the nine-category Apple privacy label**. This resolves the earlier Apple privacy configuration/publication task. Google's IARC/18+ audience and the later ten-type Data Safety save were verified separately; Apple publication is not their evidence. Machine-readable metadata and remaining work are reconciled in [listing.en.json](listing.en.json).

## Work required before final store review

1. Verify owner opt-in and installation of published Android **1.1.0 (8)**. Internal release 5 is Active and Available to internal testers with the owner-only list unchanged; Play-delivered physical installation remains unverified.
2. Verify owner installation of iOS **1.1.0 (6)** and complete physical-device QA. Apple Complete, owner-group Testing and App Store draft attachment are verified. Latest owner installation evidence remains 1.0.0 (4).
3. The approved **Destination Paradise Travel** name is saved and verified in both stores. The native display name and existing Destination Paradise brand remain unchanged; no further name-choice or application step is pending.
4. Google's final listing save is verified, with the new name and three screenshots in each phone/seven-inch/large-tablet set. Apple three-phone/three-iPad uploads are also verified. Google saved changes await Send for review; store publication remains separate.
5. Google app-information setup is complete; the dashboard removed the checklist and closed-test setup lock after Data Safety saved. Exact saved answers are in [store-privacy-answers.md](store-privacy-answers.md). Saved listing and Data Safety changes await Send for review, which has not been clicked.
6. Obtain the separate closed-test list, configure the correct Play closed track, verify actual opt-ins, conduct the required test period and apply for production access. No additional tester messages or invitations are authorized by this document itself.
7. Perform remaining controlled service, consent, recovery and physical-device QA in [README.md](README.md), [review-notes.md](review-notes.md) and [../VALIDATION.md](../VALIDATION.md) before final review submission.
8. Resolve the pending Apple DSA choice: reuse the existing trader details or use different business details. The current non-trader app default and account **In Review** state are separate; do not infer completed trader verification. Keep private address details out of repository documents.
9. Choose and save Apple App Availability countries. Build6 is saved for App Store version 1.1.0, with persistence verified after navigation. The 175 saved zero-price equivalents do not fill the country-availability setting.

## Full-logo navy icon replacement

The owner-approved navy composition is applied to the native icon and launch screen. The frozen source record is [navy-build-source-manifest.json](icon-review/navy-build-source-manifest.json). Both new signed builds have finished. Android code `5` uses EAS build `4106b3fe-467d-4769-b407-fe107d5ca526`; its exact AAB is published as internal release `3`, Active and Available to internal testers. [Final Play verification](icon-review/android-internal-release-verification.json) records the confirmation, unchanged owner-only audience and propagation limits. The code `4` sections below retain the preceding weather-correction history.

Android code `5` passed [artifact validation](icon-review/navy-android-artifact-verification.json) and [bounded native icon QA](icon-review/android-code5-icon-qa.json) on API 36 arm64 phone/tablet emulators: complete launcher logo, unclipped native splash, successful cold launch into Explore with real map tiles, and zero app errors. The existing dedicated local debug certificate signed the AAB-derived test APK; no production keystore was accessed. Root visually reviewed the phone launcher and tablet splash. These checks do not establish Play-delivered installation or physical-device runtime.

iOS build `4` has completed the artifact, upload and TestFlight stages. See [IPA verification](icon-review/navy-ios-artifact-verification.json), [EAS submission](icon-review/navy-ios-submission.json) and the later [Apple UI verification](icon-review/apple-testflight-verification.json). The submission snapshot's unverified Apple processing/group fields describe that earlier stage; root subsequently verified both in App Store Connect. The exact saved What to Test text is: “Updated the app icon and launch screen with the complete Destination Paradise logo in ivory and coral on navy.” [Play icon-save evidence](icon-review/store-icon-save.json) is separate from native-binary availability and public store publication.

## Corrected-build source record

Only `mobile/src/features/weather/weather-screen.tsx` changed at runtime: its row now has an explicit width and the seasonal column resets width/flex values on rotation. `app.json`, dependencies, endpoints and `.easignore` were unchanged. The existing `eas.json` difference only adds the already-recorded iOS submission profile; production build settings remain the same.

A fresh local EAS archive contained **82 files / 1,167,140 bytes**, all matching the workspace before and after both cloud uploads. It contained no credentials, build archives, backend, release assets or dependency trees. The frozen Weather source SHA-256 is `3b843f7b24b0430d94e50473d9125c0bec0462a636c5a024cd32d0443408ec73`. The full new [corrected source manifest](weather-layout-build-source-sha256.json) preserves every archived file hash and the two new EAS build fingerprints; [the original source manifest](build-source-sha256.json) remains untouched.

Build command, using existing remote signing credentials and remote automatic version increments:

```text
eas build --platform all --profile production --freeze-credentials --non-interactive --no-wait --json --message "Weather layout corrected for phone and tablet rotation"
```

No `--auto-submit` flag was used. Both initial build results were `NEW`; the later iOS completion is recorded separately above.

## Corrected iOS artifact and upload evidence

The official EAS CLI download helper retrieved `/tmp/destination-paradise-ios-1.0.0-build3.ipa`. Its SHA-256 is **`d78bea8938cb3bad3577ec5a113d7e33f4531e045cbe12303c48b1b7903bcc7c`**. The actual signed archive's main `Info.plist` reports:

- Bundle identifier `com.yournexttriptoparadise.mobile`; native display name `Destination Paradise`; version `1.0.0`, build `3`.
- Minimum iOS `16.4`; device families `[1,2]` (iPhone and iPad); portrait, upside-down portrait, landscape left and landscape right for both families.
- ATS arbitrary loads `false`, local networking `true`; non-exempt encryption `false`; no `NS*UsageDescription` permission strings.
- Ten bundled privacy manifests; none declares tracking or collected-data types. This does **not** negate the actual backend/OSM/AI data flows documented in the privacy worksheet, nor prove all runtime behavior.

Full redacted artifact evidence: [ios-build3-artifact-verification.json](ios-build3-artifact-verification.json). After these checks passed, the exact build was uploaded with the existing EAS-server ASC key/profile:

```text
eas submit --platform ios --id a8eb3b90-eb2c-4f2d-a6fb-1fd3507bf876 --profile production --non-interactive --no-auto-testflight-setup --no-wait
```

The subsequent supported read-only `eas submit:view c48ecd45-1469-4f70-a552-67b58c6162cf --json` confirmed completion at `2026-09-05T21:58:39.696Z`. [Submission evidence](ios-build3-submission.json) records that EAS completion snapshot, not Apple processing, tester availability or review approval. Root's later Apple UI checks separately established processing completion, then build `3` as **Ready to Test** in the owner-only group with one invited owner and automatic distribution off. No group metadata was supplied by the EAS upload command itself. The subsequent approved store name Destination Paradise Travel is now verified saved in both stores; native display-name/build settings remain unchanged.

The mobile backend/privacy page are already live on `https://destination-paradise-mobile.netlify.app`; the policy deployment agent verified updated deployment **`6a9c9097c7e4b26b67fadcd5`**. Planner/quotes remain on `https://yournexttriptoparadise.com`. Backend policy publication, the published Apple privacy label, Google saved listing/Data Safety changes and app-store availability are separate states. This task updated release evidence, started the two authorized corrected cloud builds and uploaded corrected iOS build `3` for TestFlight; the later reconciliation changed release documentation only. Root separately handled the recorded store settings and owner TestFlight invitation. The documentation work did not change branding/app configuration, submit final App Review or send additional messages.

## Corrected Android artifact and runtime evidence

Corrected code `4` AAB SHA-256: **`4d9e8e899191850d22e1f6ccf2edcbd0acb647c2ccdd9b98427f883411a1218c`**, 77,144,054 bytes. Bundletool 1.18.3 validation passed. Its exact contents were converted to a universal APK with the existing dedicated local Android debug certificate; this checks production-derived runtime behavior without claiming Play App Signing or accessing the production keystore.

On API 36 arm64 phone and tablet emulators, repeated cold launches and rotations passed: real map tiles/pins, all twelve months, persistent December selection and complete card/CTA, Apple Weather attribution/time, and Pause/Play. Both processes had zero AndroidRuntime or ReactNativeJS error lines. No quote or AI report was sent. The merged manifest identifies version `1.0.0` / code `4`, min SDK 24, target 36, Internet/Vibrate/Access Network State and the app's signature-only internal receiver permission; no GPS, camera, microphone or advertising ID permission.

[The complete artifact/runtime manifest](assets/android/qa/code4-runtime-manifest.json) includes hashes, dimensions, captures and test limitations. Physical devices, Play-generated APK delivery/signing and iOS store-signed runtime remain distinct checks.

## Previous corrected Android internal publication

Root uploaded the exact `/tmp/dp-native-release/destination-paradise-android-code4.aab`; its SHA-256 was rechecked locally against the code `4` QA manifest. Play accepted `4 (1.0.0)`, min SDK 24 / target 36. Preview showed one nonblocking missing-deobfuscation-mapping warning; native debug symbols were attached. **Save and publish succeeded**, and the fresh track showed release `2`, `1.0.0 (4) — weather rotation fix`, Available to internal testers, Active and Not reviewed, released 6 September at 02:08 EAT.

A fresh Testers-tab check confirmed only Destination Paradise owner test (one user) selected; OutreachOS (15) and Rexona (17) remained unchecked, with Save disabled. The join URL is unchanged. Owner opt-in/install, Google metadata Send for review, closed testing and public production launch remain separate and unverified/unperformed as noted above.
