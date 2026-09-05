# Android native captures and QA

These are authentic screenshots of initial candidate version 1.0.0 (3), derived from EAS production AAB `29c21f3e-68d3-4b02-b02a-6b12c2bd566d`. Final visual approval is pending a corrected candidate: Weather has persistent horizontal overflow on the phone after rotation to landscape. The failure screenshot is in `qa/` and must not be uploaded as a store asset.

| Set | Native dimensions | Captured views |
| --- | --- | --- |
| `phone/` | 1080 × 2424 | Explore map, initial Planner preferences, live Weather |
| `tablet/` | 2560 × 1600 | Explore map/sidebar, initial Planner, live Weather, Nungwi detail |
| `tablet/05-weather-portrait` | 1600 × 2560 | Live Weather in portrait |

Each view has an untouched native PNG and a JPEG copy with no alpha channel. JPEG copies use `sips` quality 100 without crop, resize, added content or reconstructed UI. Capture used Android's `adb exec-out screencap -p`; interaction used fresh screenshots or UIAutomator bounds against only the two task emulators. Screenshots show the device display with no emulator window or development navigation.

The installed APK contains the production bundle's code, signed with a dedicated local Android Debug certificate for emulator installation. Signature v2/v3 verification passed. No production keystore was accessed; Play App Signing and store processing are separate evidence.

Map/list selection, Stone Town phone detail, Nungwi tablet detail/map highlight, native Planner scrolling, live Weather loading and pause/play passed. Both paused weather frames were byte-identical; frames differed again after resuming. Tablet landscape and portrait layouts were visually correct. Phone landscape Weather clipped its seasonal description, month controls and selected-month card beyond the right edge; this remained after settling.

Weather captures show 24°C, mostly clear, 85% humidity, source updated 6 Sep at 00:20 EAT, official Apple Weather branding and legal attribution, and unavailable sea temperature. Initial synthetic Planner preferences remained 9 nights, 2 adults, 0 children, September, with consent unchecked. No AI, report, contact or quote request was sent.

Tablet was restored to its original landscape/free rotation and Explore with Stone Town selected. Phone remains landscape with Weather paused, deliberately preserved for the assigned layout fix. Its original orientation setting was free rotation with user_rotation 0.

`capture-manifest.json` records artifact hashes, signing provenance, dimensions, alpha state, exact QA outcomes and the current release gate. These screenshots do not establish final store readiness or publication.
