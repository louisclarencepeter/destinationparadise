# Google Play promotional assets

The owner-approved full-logo navy icon replacement is uploaded and saved in the
Google Play default listing. Root verified the visible navy thumbnail and the
confirmation **Change saved. Send for review in Publishing overview.**, then
dismissed the follow-up modal with **Not now**. No review submission or public
listing publication is established. The feature graphic and native screenshot
captures are unchanged. [Store-save evidence](../icon-review/store-icon-save.json)

| Asset | Export | Provenance |
| --- | --- | --- |
| `google-play-feature-graphic.png` | 1024 × 500, 24-bit RGB PNG, no alpha | New vector promotional composition in the approved navy/coral palette and Kaushan Script/Montserrat typography. Sailboat, sun and waves are illustration, not simulated app UI. |
| `google-play-icon-512.png` | 512 × 512, 32-bit RGBA PNG, fully opaque alpha, sRGB, under 1 MB | Mechanical export of the exact owner-approved `mobile/release/icon-review/full-logo-navy-candidate.png`; no further redrawing, recoloring, corner mask or shadow. |

The feature graphic contains only the approved brand name, geographic scope and
actual feature names: **Destination Paradise**, **Zanzibar & Tanzania** and
**Explore · Plan · Weather**. It includes no prices, rankings, discounts, claims
of availability or invented screenshots. Its core content stays away from the edges.

The selected icon keeps the entire approved full-logo composition on its navy
background. Google permits 32-bit PNG and recommends a solid brand background;
the export has an alpha channel with every pixel fully opaque. Root verified the
navy replacement in the saved Play Console preview. [Play icon specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)

The feature PNG's exact dimensions, RGB channels and absence of alpha were checked.
The icon's dimensions, RGBA channels, sRGB interpretation, size and approved source hash
were checked. Both assets were visually reviewed. Export requirements were checked
against [Google Play's preview-asset guidance](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).

Alt text, byte sizes, hashes and per-asset provenance are stored in
`play-promotional-assets.json`. The saved asset-specific AI declaration selects
**App icon** for the new AI-assisted navy logo and **Feature graphic** for the existing
AI-assisted vector artwork. All native screenshot selections remain unchecked.
The icon's platform export only resizes the approved image. Neither promotional
asset is a native screenshot.

The replacement native binaries are building separately: Android version code **5**
(`4106b3fe-467d-4769-b407-fe107d5ca526`) and iOS build **4**
(`4a785994-db2c-40fc-9329-a296e584ec15`). Saving the Play listing icon does not establish
that either new binary has completed or is available to testers.

Reproduce from the repository root:

```sh
node mobile/release/assets/build-play-assets.mjs
```

This uses the repository's Sharp renderer, Python fontTools, and the mobile package's
existing licensed font files. The SVG contains outlined text and has no external
font or image dependency. `font-outlines.py` preserves the typefaces' actual contours.
The build script rejects invalid geometry and verifies format and the approved icon
source hash. It imports the mechanical icon exporter; rerunning it cannot silently
restore the previous website logo as the app icon. For icon-only exports, run
`node mobile/scripts/export-app-icons.mjs` without regenerating the feature graphic.
