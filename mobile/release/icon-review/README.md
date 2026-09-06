# Full-logo app icon review

The owner requested an icon improvement, explicitly chose to keep the full Destination Paradise logo, and approved the exact navy candidate for the next app build. It retains the full composition and wording, with ivory/coral artwork, larger visual scale and a dark background. The approved candidate is AI-assisted; it is not a byte-identical export of the original logo.

- Candidate: `full-logo-navy-candidate.png`, 1254 × 1254 opaque PNG.
- Original source: `../../../public/assets/brand/destination-paradise-logo.png` (898 × 898 RGBA; repository-root path `public/assets/brand/destination-paradise-logo.png`).
- Approved candidate SHA-256: `b1e8e1625f0ff36a66613afa5905af38d01b881a786136d74a297b04dec72b1d`.
- Applied icon source: `../../assets/icon.png`.
- Method: built-in image generation, using both original logo and current icon as edit references.
- Status: selected and mechanically exported into native assets and Google Play artwork. Signed iOS build 4 and Android code 5 are complete; current testing availability and provider saves are recorded in `../PUBLISH_STATUS.md` and the verification manifests in this directory.
- Reproduce from the repository root: `node mobile/scripts/export-app-icons.mjs`.
- The exporter verifies the approved source hash. It resizes the exact approved pixels without redrawing, recoloring or removing any motif.

## Applied platform exports

| File | Format | Treatment |
| --- | --- | --- |
| `../../assets/icon.png` | 1024 × 1024 opaque RGB PNG | Entire approved square resized; no corner mask. |
| `../../assets/android-icon-foreground.png` | 1024 × 1024 opaque RGB PNG | Entire approved square resized to 696px and positioned at x182/y207 so the visible artwork is centred. Boundary navy pixels extend outward to avoid a contrasting frame. |
| `../../assets/splash-icon.png` | 512 × 512 opaque RGB PNG | Entire approved square resized; splash backing approximates its corner navy as `#031C32`. |
| `../../assets/favicon.png` | 48 × 48 opaque RGB PNG | Entire approved square resized. |
| `../assets/google-play-icon-512.png` | 512 × 512 RGBA PNG with fully opaque alpha | Entire approved square resized; 269,748 bytes, sRGB, no corner mask or external shadow. |

The adaptive foreground's complete measured ivory/coral artwork is 586 × 539px,
at x218–803/y243–781. Its maximum radius from the canvas centre is 308.014px,
inside the 312.889px guaranteed Android safe radius (66/108 of the canvas diameter).
Both the original lettering and the palms, traveller, sailboat and rays remain.
The approved raster contains slight navy variation; its edge pixels are extended
mechanically for Android, rather than drawing a new background or changing artwork.
The app's ordinary screen background remains unchanged.

Exact output dimensions, channels, byte sizes, hashes and safe-area measurements are
recorded in `icon-export-manifest.json`. These are asset checks, not device-install
evidence. Inspect the rebuilt launch icon and splash on actual platform builds.

## Prompt

Use case: precise-object-edit. The user explicitly says KEEP THE FULL LOGO. Image 1 is the original complete Destination Paradise logo. Image 2 is its current poorly spaced phone app icon. Create an improved iPhone/Android square app icon by faithfully retaining the ENTIRE original logo: exact distinctive lettering DESTINATION at top and PARADISE at bottom, exact cursive slogan 'your next trip to paradise', the same central human silhouette with arms out, the same palm trees at left, same sailboat at right, broken circular ring and rays. These shapes, lettering, typography, arrangement and all details are locked. Do not simplify, reinterpret, redraw as another logo, omit the person, or replace any motif. Change ONLY presentation: eliminate wasted blank space, align the logo by its actual visible artwork bounds, enlarge the complete design to occupy approximately 86 percent of the square width, and improve contrast for a small home-screen icon. Use a full-bleed perfectly uniform deep navy background #071C2B, with all formerly dark teal artwork changed to warm ivory #F7F5EF and the coral artwork staying coral #FF6B5B. Retain every feature and all lettering faithfully. Flat crisp solid-color edges, no texture, glow, shadow, border, mockup or built-in corner rounding. One single square app icon only, ideally exactly 1024x1024. If legibility requires a choice, preserving the original logo identity and text is paramount.

## Previous icon spacing audit

The original's full nonzero-alpha bounds are x18–799/y28–749 (782 × 722); its faint upper rays must not be cropped away. The previous 1024px iOS icon's visible art was 698 × 646, displaced approximately 35px left and 53px above centre. The comparison preserves that historical export as `previous-icon.png`. This review records the original composition problem separately from the approved recoloured candidate.
