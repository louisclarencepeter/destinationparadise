# Google Play promotional assets

Prepared locally on 6 September 2026 (Africa/Dar_es_Salaam). These files have not
been uploaded or published. Actual native screenshots are a separate capture set.

| Asset | Export | Provenance |
| --- | --- | --- |
| `google-play-feature-graphic.png` | 1024 × 500, 24-bit RGB PNG, no alpha | New vector promotional composition in the approved navy/coral palette and Kaushan Script/Montserrat typography. Sailboat, sun and waves are illustration, not simulated app UI. |
| `google-play-icon-512.png` | 512 × 512, 32-bit RGBA PNG, sRGB, under 1 MB | Byte-for-byte copy of `public/assets/brand/destination-paradise-logo-512.png`; no regeneration, editing, resizing or added corner mask/shadow. |

The feature graphic contains only the approved brand name, geographic scope and
actual feature names: **Destination Paradise**, **Zanzibar & Tanzania** and
**Explore · Plan · Weather**. It includes no prices, rankings, discounts, claims
of availability or invented screenshots. Its core content stays away from the edges.

The selected icon retains the original logo's transparency. Google permits
32-bit PNG and recommends a solid brand background where possible; the unchanged
approved source was selected to preserve the brand exactly. Verify its appearance
against the Play Console preview before submission. [Play icon specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)

The feature PNG's exact dimensions, RGB channels and absence of alpha were checked.
The icon's dimensions, RGBA channels, sRGB interpretation, size and byte identity
were checked. Both assets were visually reviewed. Export requirements were checked
against [Google Play's preview-asset guidance](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).

Alt text, byte sizes, hashes and per-asset provenance are stored in
`play-promotional-assets.json`. The feature is AI-assisted original vector artwork;
consider that provenance for any asset-specific AI declaration. The copied icon's
earlier creation history remains with the owner; this task added no generated content
to it. Do not classify either asset as a native screenshot.

Reproduce from the repository root:

```sh
node mobile/release/assets/build-play-assets.mjs
```

This uses the repository's Sharp renderer, Python fontTools, and the mobile package's
existing licensed font files. The SVG contains outlined text and has no external
font or image dependency. `font-outlines.py` preserves the typefaces' actual contours.
The build script rejects invalid geometry and verifies format and icon identity.
