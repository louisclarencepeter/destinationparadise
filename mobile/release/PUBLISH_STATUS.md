# Destination Paradise — publishing status

Latest listing reconciliation: **6 September 2026 EAT**, including Google IARC completion at 01:28 EAT, the subsequent target-audience save, and the later Play Console save/access failure. Store UI facts were supplied by the root task from authenticated App Store Connect / Play Console checks. Corrected iOS submission completion was checked directly; the Android agent recorded exact-artifact runtime QA at 22:15 UTC on 5 September.

**Public app-store launch is not complete.** Android has a published internal-test release for code `3`. Corrected iOS build `3` is finished, its actual IPA passed static identity/device-support checks, and the TestFlight upload completed. Apple now shows build `3` as **Ready to Test** in the owner-only TestFlight group, with one owner tester **Invited** and automatic distribution off. Invitation acceptance or installation is not established. The nine-category Apple privacy label is published. Corrected Android code `4` passed the bounded standalone phone/tablet regression; its Play upload is not yet established. Google Data Safety was filled and previewed but **did not save successfully**; error `5C897C1E` persisted and a fresh dashboard returned 403. No final App Review was submitted.

## iOS / iPadOS

| Item | Verified state |
| --- | --- |
| Publishing account | Existing Louis Peter account accepted by the user |
| Apple app ID | `6809042574` |
| Bundle ID | `com.yournexttriptoparadise.mobile` |
| Store version | `1.0.0` |
| Current App Store name | **Destination Paradise Zanzibar — provisional.** Exact spacing verified in Apple UI. The user dislikes this name; preferred-name answer is pending. Do not treat it as final branding. |
| Previous signed EAS build | `62008916-18a2-45f0-a27a-77deabe2041f` — `FINISHED`, version `1.0.0`, build `2`; build completed `2026-09-05T21:20:40.451Z` |
| Previous EAS submission | `2e21faa5-43e8-43ec-893c-1fe82153a5b2` — **`FINISHED`**, created `2026-09-05T21:33:01.598Z`, completed `2026-09-05T21:33:15.960Z`, no error code |
| Previous build 2 processing | Root verified build `2` as **Ready to Submit**, expires in 90 days, with `0/–` invites displayed. This does not establish any tester has been invited or installed it. |
| Corrected cloud build | `a8eb3b90-eb2c-4f2d-a6fb-1fd3507bf876` — **`FINISHED`**, version `1.0.0`, build `3`; created `2026-09-05T21:49:13.404Z`, completed `2026-09-05T21:54:49.192Z`. |
| Corrected IPA inspection | Actual 21,380,138-byte IPA verified; identity, device families, orientations, ATS and privacy manifest summary are below. |
| Corrected EAS submission | `c48ecd45-1469-4f70-a552-67b58c6162cf` — **`FINISHED`**, created `2026-09-05T21:58:26.273Z`, completed `2026-09-05T21:58:39.696Z`, no error code. Exact build `3`, ASC app `6809042574`; no automatic TestFlight group setup or App Review. |
| Corrected Apple processing / TestFlight | Build `1.0.0 (3)` is **Ready to Test** in owner-only group **Destination Paradise owner test** (`0db9334b-5e79-4fa1-8950-e0e782456ba8`). One tester, `louisclarencepeters@gmail.com`, is **Invited**. Automatic distribution is **off**. Acceptance/install is not verified. |
| App Store version build selection | **Build `3` saved and persistence verified.** Root reattached `3`, saved until Save was disabled, navigated to App Information and back through the menu, then confirmed the App Icon/build `3`/version `1.0.0` row and disabled Save remained. No App Review was submitted. |
| Final App Review | Not submitted; final name, DSA choice, country availability and remaining release-device/service QA are open |
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
| Accepted AAB | Version `1.0.0`, version code `3` |
| Internal release | Release `1` published and available to internal testers |
| Internal track | `4701496308193764699` |
| Internal join URL | `https://play.google.com/apps/internaltest/4701496308193764699` |
| Saved internal testers | Root verified one saved/selected owner-list user: `louisclarencepeters@gmail.com`; other lists unchecked and track Active. Saved eligibility is not proof of a completed tester opt-in or installation. |
| Corrected cloud build | `d5ad03c9-bca0-4d33-9ba5-2c9cebe89260` — **`FINISHED`** at `2026-09-05T22:03:13Z`, version `1.0.0`, code `4`; created `2026-09-05T21:48:49.283Z`. Exact-artifact standalone phone/tablet regression **passed**; evidence is below. No corrected Play upload is established here. |
| Google listing draft | Copy, icon, feature graphic, three phone screenshots and three large-tablet screenshots saved **as draft only**. |
| Seven-inch screenshots | Three authentic captures are **ready locally, not uploaded**. [Capture evidence](assets/android/tablet-7/capture-manifest.json). |
| Setup progress | Dashboard **8 of 11** after IARC completion: privacy, app access, ads, government, finance, health, category/contact and content rating complete. Target audience was subsequently saved; the dashboard count needs a fresh check. |
| IARC content rating | **Completed/saved** 6 September, 01:28 EAT. ESRB Everyone (Alcohol Reference), PEGI 3, USK All ages, ClassInd All ages, Generic 3+. Downloaded-content alcohol references Rarely; other downloaded categories No; online content Yes (AI), online age categories No; miscellaneous No. |
| Target audience | **18 and over — saved.** This is separate from calculated IARC age ratings. |
| Google Data Safety | **All ten types filled to the worksheet and preview verified; save failed.** Save and Save as draft / Save Draft retries returned unexpected error `5C897C1E`. Original filled form remains open in tab 15. No saved or published state is claimed. |
| Current Play Console access | Fresh dashboard in tab 16 returned **403 Forbidden**. Further store work is paused at this provider failure. Code `4` and the seven-inch screenshots have **not** been uploaded. |
| Closed testers | A **separate Destination Paradise list** is expected from the user. Do not reuse the OutreachOS 15-person list. |
| Closed-test production gate | Not completed. Internal testing does not satisfy the closed-test requirement. |
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

The privacy URLs are saved and **Louis Peter published the nine-category Apple privacy label**. This resolves the earlier Apple privacy configuration/publication task. Google Data Safety and any remaining Google audience/rating form answers are not established by this Apple publication. Machine-readable metadata and remaining work are reconciled in [listing.en.json](listing.en.json).

## Work required before final store review

1. Upload corrected Android code `4` to the intended Play test track and verify the owner's opt-in/install. The currently published internal release remains code `3`. The corrected AAB-derived local test APK passed the phone/tablet regression; Play-generated delivery/signing is a separate check.
2. Verify iOS build `3` through the owner's TestFlight invitation and remaining release-device checks. Its upload, Apple processing, group assignment and invitation are complete; invitation acceptance/install and physical-device runtime are not established.
3. Apply the user's approved final App Store name after the pending preference is answered. Preserve the provisional-name status until then.
4. Upload the ready authentic seven-inch Google screenshots and review final store assets against the corrected candidate. Apple three-phone/three-iPad uploads and Google copy/icon/feature/three-phone/three-large-tablet draft saves are already verified.
5. Resume from the preserved Google Data Safety form after Play Console access/save service recovers. All ten types and the preview are complete, but saving failed with `5C897C1E` and a fresh dashboard returned 403. Verify persisted answers before marking Data Safety complete or rechecking the setup dashboard; use [store-privacy-answers.md](store-privacy-answers.md) for the entered answers. IARC and target audience 18+ are saved. Apple privacy is published; saved contact, copyright, Travel category, 13+ rating, URLs, free pricing and third-party-content answer do not need blanket reconfirmation.
6. Obtain the separate closed-test list, configure the correct Play closed track, verify actual opt-ins, conduct the required test period and apply for production access. No additional tester messages or invitations are authorized by this document itself.
7. Perform remaining controlled service, consent, recovery and physical-device QA in [README.md](README.md), [review-notes.md](review-notes.md) and [../VALIDATION.md](../VALIDATION.md) before final review submission.
8. Resolve the pending Apple DSA choice: reuse the existing trader details or use different business details. The current non-trader app default and account **In Review** state are separate; do not infer completed trader verification. Keep private address details out of repository documents.
9. Choose and save Apple App Availability countries. Apple App Store version build `3` selection is saved and verified after navigation. The 175 saved zero-price equivalents are pricing records and do not fill this availability setting.

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

The subsequent supported read-only `eas submit:view c48ecd45-1469-4f70-a552-67b58c6162cf --json` confirmed completion at `2026-09-05T21:58:39.696Z`. [Submission evidence](ios-build3-submission.json) records that EAS completion snapshot, not Apple processing, tester availability or review approval. Root's later Apple UI checks separately established processing completion, then build `3` as **Ready to Test** in the owner-only group with one invited owner and automatic distribution off. No group metadata was supplied by the EAS upload command itself. The provisional App Store name is preserved.

The mobile backend/privacy page are already live on `https://destination-paradise-mobile.netlify.app`; the policy deployment agent verified updated deployment **`6a9c9097c7e4b26b67fadcd5`**. Planner/quotes remain on `https://yournexttriptoparadise.com`. Backend policy publication, the published Apple privacy label, Google listing drafts and app-store availability are separate states. This task updated release evidence, started the two authorized corrected cloud builds and uploaded corrected iOS build `3` for TestFlight; the later reconciliation changed release documentation only. Root separately handled the recorded store settings and owner TestFlight invitation. The documentation work did not change branding/app configuration, submit final App Review or send additional messages.

## Corrected Android artifact and runtime evidence

Corrected code `4` AAB SHA-256: **`4d9e8e899191850d22e1f6ccf2edcbd0acb647c2ccdd9b98427f883411a1218c`**, 77,144,054 bytes. Bundletool 1.18.3 validation passed. Its exact contents were converted to a universal APK with the existing dedicated local Android debug certificate; this checks production-derived runtime behavior without claiming Play App Signing or accessing the production keystore.

On API 36 arm64 phone and tablet emulators, repeated cold launches and rotations passed: real map tiles/pins, all twelve months, persistent December selection and complete card/CTA, Apple Weather attribution/time, and Pause/Play. Both processes had zero AndroidRuntime or ReactNativeJS error lines. No quote or AI report was sent. The merged manifest identifies version `1.0.0` / code `4`, min SDK 24, target 36, Internet/Vibrate/Access Network State and the app's signature-only internal receiver permission; no GPS, camera, microphone or advertising ID permission.

[The complete artifact/runtime manifest](assets/android/qa/code4-runtime-manifest.json) includes hashes, dimensions, captures and test limitations. Physical devices, Play-generated APK delivery/signing and iOS store-signed runtime remain distinct checks.
