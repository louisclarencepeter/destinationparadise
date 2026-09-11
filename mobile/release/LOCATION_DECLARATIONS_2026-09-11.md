# Concrete location declaration proposal — 11 September 2026

Recommendation for the existing frozen replacement artifacts: **add Apple Precise Location, retain Apple Coarse Location, and retain Google Approximate Location only.** Add the location-driven personalization purpose. No new business identity or retention promise is needed for these factual changes. Apple App Privacy changes remain proposed; the saved Google corrections are recorded below. Apple’s 1.1.0/build 6 Waiting for Review must remain attached and untouched; the new 1.1.1/build 7 is private at EAS.

## Apple: current → proposed

Current fields below come from the previously verified worksheet/provider receipt; fresh App Store Connect UI access now redirects to owner sign-in, so read the exact existing values again before saving. Existing Coarse Location is collected, linked to the user, not used for tracking, for App Functionality and Analytics. Precise Location was not selected.

| Field | Current | Proposed |
|---|---|---|
| Location → Coarse Location | Selected | Keep selected |
| Coarse purposes | App Functionality; Analytics | Keep both; add Product Personalization |
| Coarse linked to user / tracking | Yes / No | Keep Yes / No |
| Location → Precise Location | Not selected | Select collected |
| Precise purposes | Not applicable | App Functionality; Product Personalization; Analytics |
| Precise linked to user / tracking | Not applicable | Yes / No |
| Other existing eight non-location types | Existing values | Preserve |

This is a conditional data flow when a user enables higher accuracy; Apple requires disclosure across users/settings. Retained IP-linked OSM records justify conservative linkage. No advertising/tracking purpose was found. Nearby map centering and recommended places are personalized by location; existing provider operational/usage analysis remains Analytics. [Apple privacy definitions and purposes](https://developer.apple.com/app-store/app-privacy-details/).

The signed IPA sets reduced accuracy by default, but Apple explicitly permits users to override that in Settings. The app requests Expo Balanced accuracy and does not reject full-accuracy permission. It rounds accepted coordinates to 3 decimals; enlarging the displayed circle to 150 m does not coarsen the coordinate further. [Apple setting](https://developer.apple.com/documentation/bundleresources/information-property-list/nslocationdefaultaccuracyreduced), [Expo57 accuracy](https://docs.expo.dev/versions/v57.0.0/sdk/location/).

The transmitted-data concern is reproducible: a synthetic full-accuracy input at (-6.146, 39.150), rendered by the frozen web export at 430×508 map viewport, produces four zoom 17 tile paths that constrain the centered position to 0.0008798° longitude by 0.00004267° latitude if viewport dimensions are known. That meets Apple’s 3-decimal-equivalent threshold. This demonstrates an inference capability, not actual OSM profiling. All tile requests were intercepted locally. See [the synthetic request receipt](evidence/2026-09-11-nearby-source/precise-inference-verification.json); the 13-check UI run is retained with the local release evidence.

## Google: current → proposed

Play Console was verified during this release, then the proposed Personalization additions for collection and sharing were saved with “Change saved” confirmation. No app review submission occurred. The Current column records the values before that update.

| Field | Current | Proposed |
|---|---|---|
| Approximate location / Precise location | Selected / Not selected | Keep both unchanged |
| Approximate collected / shared | Yes / Yes | Keep |
| Ephemeral | No | Keep |
| Required / Optional | Required | Keep Required: ordinary automatic map/IP-derived location remains even when Nearby is off |
| Collection purposes | App functionality; Analytics; Fraud prevention, security and compliance | Keep all; add Personalization |
| Sharing purposes | App functionality; Analytics; Fraud prevention, security and compliance | Keep all; add Personalization |
| Advertising ID | Previously unanswered | No was saved with “Change saved”; not submitted or approved |
| Other nine types | Existing values | Preserve |

Android 10’s exact signed manifest and OS prompt permit only coarse location, with no fine/background location permission. Google explicitly categorizes Android `ACCESS_COARSE_LOCATION` as Approximate. A fine map view around an already coarse estimate does not recover the device’s physical location more accurately. Keep Precise unselected for this Android artifact. [Google categories](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [Android accuracy](https://developer.android.com/develop/sensors-and-location/location/permissions).

## Policy wording to clarify before changed-feature distribution

The live 11 September policy correctly explains local coordinates and outgoing map-area requests, but repeatedly calls all input approximate. Recommended addition to its Nearby section:

> Android provides approximate location. On iOS the app requests reduced accuracy by default; you can change this in system Settings. If you enable Precise Location, the reading may be more accurate. The app rounds coordinates to three decimal places before using them. When a map is centered on that reading, OpenStreetMap’s tile requests may reveal a correspondingly smaller area.

This is a disclosure clarification for the current binary, not a claim that raw GPS coordinate values are uploaded. It can be published without rebuilding the signed apps. This wording is included in the current policy source follow-up. Integration and the existing website-preservation deployment guard precede publication.
