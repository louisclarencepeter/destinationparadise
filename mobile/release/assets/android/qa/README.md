# Android Weather rotation evidence

`phone-weather-landscape-overflow.png` is the unchanged failure capture from the first production AAB, version 1.0.0 / code 3. Its artifact identity is in the parent `capture-manifest.json`.

The eight `go-*.png` files are untouched native screenshots verifying the narrow responsive layout fix through Expo Go 57.0.9. The companion `weather-layout-go-manifest.json` records their hashes, dimensions, source fingerprint, rotation sequence and observed results. Expo Go captures are QA evidence only; do not upload them as store screenshots.

The replacement production Android build is `d5ad03c9-bca0-4d33-9ba5-2c9cebe89260`, version 1.0.0 / code 4. It finished at 22:03:13 UTC. The following bounded release-artifact gate **passed**, with artifact/signature identity, merged permissions, runtime results and screenshot hashes recorded in `code4-runtime-manifest.json`:

1. Resolve the artifact through the official EAS CLI, download the AAB and record its SHA-256; validate bundle metadata and version code.
2. Derive a local test APK from that exact AAB using the existing dedicated debug signer, without source changes. Record its SHA-256 and signer fingerprint. This does not test Play App Signing.
3. Install the APK on the existing phone and tablet emulators, preserving app data, and confirm the running package/version.
4. Cold-launch into Explore, verify real map tiles, then open Weather with live Apple data and exercise Pause/Play.
5. Repeat the phone portrait → landscape → portrait → landscape sequence, select the last month, inspect card/description/CTA bounds, and verify the tablet landscape → portrait → landscape layout.
6. Force-stop and cold-launch again, inspect application errors and preserve native screenshots separately from Expo Go evidence. Do not send AI, quote, contact or report requests during this bounded regression check.

The `code4-*.png` files are actual standalone screenshots from the production-derived APK, separate from `go-*.png`. `code4-phone-landscape-bounds.json` records the wrapped description and twelve visible month-button bounds. The three 7-inch-class store captures are in `../tablet-7/`, with their own manifest and exact viewport/restoration details.

This gate does not replace physical-device testing, store review, final store capture approval or signed iOS distribution checks.
