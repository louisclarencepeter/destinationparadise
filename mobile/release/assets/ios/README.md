# iOS store screenshots

Captured 6 September 2026 (EAT) from the standalone Destination Paradise simulator app, version 1.0.0 (1), EAS build `e9a5dd2a-d500-4daa-a32e-8fea7de77472`.

Use the JPEG files for App Store Connect upload. They preserve the native capture dimensions and have no alpha channel. The PNG files are the untouched Simulator exports and include an alpha channel. JPEG conversion used macOS `sips`, quality 100, without cropping, resizing, adding content or altering the app display.

| Set | Device | Dimensions | Screens |
| --- | --- | --- | --- |
| `iphone-6.9/*.jpg` | iPhone 17 Pro Max, iOS 26.5 | 1320 × 2868 | Explore map; initial Planner preferences; live Weather |
| `ipad-13/*.jpg` | iPad Pro 13-inch (M5), iOS 26.5 | 2064 × 2752 | Explore map/sidebar; two-column Planner; two-column Weather |

The captures were inspected in Simulator through CUA and exported using the native Save Screen toolbar action. They contain the device display only, without Simulator bezels, desktop or Expo Go navigation. No screenshot was generated or recreated.

Explore shows numbered Zanzibar pins, the Stone Town label, and map attribution. Weather shows 24°C, mostly clear, 85% humidity, the reading updated 6 Sep at 00:20 EAT, official Apple Weather branding and legal attribution, and sea temperature explicitly unavailable. Planner retains its initial synthetic preferences with consent unchecked; no AI request, report, contact or quote was sent for these captures.

No layout defect was visible in the six captured initial views. Capture used tab navigation and did not retest scrolling, keyboard entry, map gestures or the planner chat. The two capture devices were shut down afterward; pre-existing simulator sessions were left running.

`capture-manifest.json` records the exact capture times, source build, device identifiers, dimensions, alpha state, file sizes and SHA-256 hashes. These screenshots provide the requested three-scene set; the optional additional scenes in the broader asset plan have not been captured here.
