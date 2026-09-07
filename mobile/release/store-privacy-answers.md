# Store privacy answers — review worksheet

Reviewed 6 September 2026 EAT against the current mobile source, existing planner functions, public pages and the specific Netlify environment metadata noted below. Existing Louis Peter publishing accounts are the accepted account choice. The root task subsequently verified Apple privacy publication and saved Google IARC/18+ audience answers; Google Data Safety was subsequently saved and verified with all ten exact worksheet types/purposes after the earlier failed save. Saved changes await Send for review; no publication is established. Corrected Android code `4` was subsequently published to the existing owner-only internal track; that internal release did not send the saved Google listing/Data Safety metadata for review or establish a public launch. See [PUBLISH_STATUS.md](PUBLISH_STATUS.md) for the latest store actions. The public map disclosure was subsequently updated and deployed as recorded below.

## Public support and privacy fields

| Field | Verified entry |
| --- | --- |
| Support URL / contact website | `https://yournexttriptoparadise.com/#contact` |
| Support email | `info@yournexttriptoparadise.com` |
| Public support phones | `+255 768 779 517` and `+255 748 352 657` |
| Public support hours | Daily, 08:00–19:00 EAT |
| Marketing website | `https://yournexttriptoparadise.com/` |
| Privacy policy | `https://destination-paradise-mobile.netlify.app/mobile-privacy.html` |
| Published deletion-request instructions | `https://destination-paradise-mobile.netlify.app/mobile-privacy.html#choices` |

Live reads returned HTTP 200 for the website and mobile privacy page. The website HTML contains the `contact` anchor, public email and matching `mailto:` link. The privacy page gives an email-based request mechanism for access/correction/deletion, including limitations on records that must be retained. Mailbox syntax and publication are verified; no email, phone call, Gmail access or delivery test was performed. Public company support is not proof of a named person's App Review contact details. [Public contact](https://yournexttriptoparadise.com/#contact), [published mobile policy](https://destination-paradise-mobile.netlify.app/mobile-privacy.html#choices).

## Answers supported by the implementation

The 7 September Nearby implementation passed local validation and exact Android code `6` functional QA; signed iOS build `5` inspection/upload and revised policy deployment also passed. Corrected Android code `7` passed artifact/device-coverage and bounded native QA and is published as owner-only internal release `4`, with zero devices lost. This does not change saved/published privacy answers or establish public availability. See [PUBLISH_STATUS.md](PUBLISH_STATUS.md) for exact evidence and the still-unverified iOS build `5` processing/group state.

| General question | Answer and scope |
| --- | --- |
| Does the app collect user data? | **Yes.** AI requests, quote contact/transcript, reports and retained network/security metadata leave the device. |
| Is collected data encrypted in transit? | **Yes for the inspected release paths.** App/backend, map-tile, image, Anthropic and Resend requests use HTTPS. This is not end-to-end encryption. Release environment overrides must remain HTTPS. |
| Does the app create accounts or require login? | **No.** No account creation, sign-in, account ID or account-management flow exists. |
| Can users request deletion? | A public email-based request mechanism exists at the URL above. This supports saying a request mechanism is offered; fulfillment timing and deletion across each provider have not been tested. Device reset clears local saved places/preferences only. |
| Does the app contain ads or advertising tracking code? | No advertising, attribution, cross-company ad tracking or native analytics SDK was found in the mobile source/dependencies. No tracking purpose is identified. |
| Does it collect device location? | Nearby accesses approximate foreground location only after opt-in and permission, matching bundled destinations/experiences on device. Coordinates remain in memory and are not saved or sent to backend, AI, maps or reverse geocoding. Only the enabled preference persists. Weather still uses fixed Zanzibar coordinates and map pins remain supplied destinations. **Retain provider-derived approximate-location collection/sharing disclosures:** OSM retains client country with IP/request records, as detailed below. |
| Does it collect payment data, a photo library, audio, contacts or calendars? | No such collection path was found. Value/Mid-range/Luxury is a travel preference, not a payment-card or income field. Remote destination photographs are not the user's photos. |
| Are locally saved places and preferences collected automatically? | They remain in AsyncStorage. Selected trip context is transmitted when the user opts into AI planning or sends a quote. Chat and contact fields are held in session memory. |

Evidence: `../package.json`, `../app.json`, `../src/api/`, `../src/state/trip-store.tsx`, `../src/features/planner/planner-screen.tsx`, `../src/features/planner/planning-context.ts`, and `../../netlify/functions/{planner,planner-send,planner-report,_shared,_weather_proxy}.mjs`.

### Nearby: on-device access and store collection are different

Nearby refreshes a one-shot approximate reading when a new app session starts or the app returns to the foreground only while enabled, and offers manual refresh and turn-off. Android uses coarse location; iOS defaults to reduced accuracy. No background access, user-location pin, location-based tile centering or reverse geocoding is part of this feature. Planning passes only the selected destination into the existing consent-based flow, without coordinates, distances or a current-location label.

Apple excludes data processed only on device from collection; Google likewise excludes on-device-only access/processing. Therefore this implementation adds no Precise Location or new location-collection purpose to the existing store answers. Source/unit/browser checks found no origin-coordinate storage or network leakage; signed-artifact permission checks, Android native functional QA and corrected code `7` verification also passed within the scope in [PUBLISH_STATUS.md](PUBLISH_STATUS.md). Store-delivered runtime checks remain separate. Keep existing OSM-derived Coarse/Approximate Location and its automatic/required/shared treatment unchanged. Do not label local-only coordinates as ephemeral off-device collection. Reassess if coordinates or derived current-location information are sent later. [Apple on-device guidance](https://developer.apple.com/app-store/app-privacy-details/), [Google on-device exclusion](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).

## Apple App Privacy — published selections

The root task verified all nine data types published by Louis Peter, all linked to the user and not used for tracking. The grouped rows below match those saved types and purposes.

| Data type | Selection | Purpose |
| --- | --- | --- |
| Contact Info → Name, Email Address, Phone Number | Collected; linked to user; not used for tracking | App Functionality |
| User Content → Other User Content | Collected; linked; not tracking | App Functionality; Product Personalization |
| User Content → Customer Support | Collected; linked conservatively; not tracking | App Functionality |
| Other Data → Other Data Types | Collected; linked conservatively; not tracking | App Functionality; Product Personalization for requested ages/trip details |
| Diagnostics → Other Diagnostic Data | Collected through configured backend error monitoring; linkage needs the conservative treatment described below; not tracking | App Functionality |
| Usage Data → Product Interaction | Collected through OSM map-request paths/times associated with IP; linked conservatively; not tracking | App Functionality; Analytics for provider service usage/planning |
| Location → Coarse Location | Collected through OSM client-country records; linked conservatively; not tracking | App Functionality; Analytics for provider service usage/planning |

The contact form and AI prompt explicitly solicit name/email/optional phone. `planner.mjs` also explicitly asks children's ages when relevant; those ages belong under Other Data Types, rather than relying solely on the generic free-text rule. Chat and trip text map to Other User Content. Reports map to Customer Support; selected output/notes are not anonymized and can contain identity details. Retained IP/security records also support Other Data Types. No identity-stripping process covers all of these flows, so “not linked” is not established.

Do not use Apple's optional-feedback exemption for the whole app: planning/quoting is primary functionality, and the report sheet does not display a user/account name. Do not select native Crash Data or Performance Data solely because server Sentry exists; inspect the actual events/traces first. Apple defines collection by off-device retention beyond serving the request, and maps generic free-form text to Other User Content while separately categorizing specifically requested fields. [Apple's definitions and field guidance](https://developer.apple.com/app-store/app-privacy-details/).

## Google Play Data Safety — saved and verified

Root restored all ten types/purposes below in a fresh form after the earlier failed save had lost the entries, then verified the preview. Save returned **Changes saved / Send for review**; the confirmation modal showed Save and Save Draft disabled. These declarations are **saved and verified**, but Send for review has not been clicked and publication is not established. Root then verified app-information setup completion: the dashboard removed its setup checklist and closed-test setup lock, without displaying an 11/11 count.

The earlier `5C897C1E` save error and dashboard 403 are historical failures, resolved after Console access recovered. The unsaved form formerly in tab 15 was lost and that tab is now closed; no preserved original form remains. Current Console work uses tab 18.

| Data type | Collected? | Optional? | Ephemeral? | Purposes |
| --- | --- | --- | --- | --- |
| Personal info → Name, Email address, Phone number | Yes | Yes: browsing works without them; phone remains optional within quotes | No | App functionality |
| Personal info → Other info | Yes: requested children's ages/group details | Yes | No | App functionality; Personalization |
| Messages → Other in-app messages | Yes: chat and reviewed transcript | Yes | No | App functionality; Personalization |
| App activity → Other user-generated content | Yes: report notes and trip responses not otherwise classified | Yes | No | App functionality; Personalization for trip responses; Fraud prevention, security and compliance for safety reports |
| Device or other IDs | Yes: retained IP identifies request sources; also shared with OSMF | Required: automatic network flow; no universal opt-out | No | App functionality; Analytics for OSM service usage/planning; Fraud prevention, security and compliance |
| App activity → App interactions | Yes: map tile/request activity retained by OSMF; also shared | Required: automatic map flow; no universal opt-out | No | App functionality; Analytics; Fraud prevention, security and compliance |
| Location → Approximate location | Yes: OSM client-country records; also shared | Required: automatic map flow; no universal opt-out | No | App functionality; Analytics; Fraud prevention, security and compliance |
| App info and performance → Diagnostics | Yes: OSM response status/latency records and configured backend technical-error monitoring; also shared with OSMF | Required: automatic network diagnostics; no universal opt-out | No | App functionality; Analytics |

The grouped rows represent **ten individual data types**: Name, Email address, Phone number, Other personal info, Other in-app messages, Other user-generated content, Device or other IDs, App interactions, Approximate location and Diagnostics. Root restored and verified these ten types in the fresh form preview, then confirmed the successful save. Submission for review remains separate. Ordinary requested quote replies support App functionality. Do not select Developer communications solely for that service response; no separate product-update, marketing or outage-notification program was found. [Google purposes](https://support.google.com/googleplay/android-developer/answer/10787469).

Google's definitions expressly include controlled WebViews, chat content and open-ended notes. It treats IP according to its use; here the backend uses it as a security bucket identifier. These category mappings are interpretations of the implementation, not a claim that the app generates an advertising or installation ID. Persistent quote/report emails and retained rate-limit keys cannot be marked ephemeral. [Google's form definitions](https://support.google.com/googleplay/android-developer/answer/10787469).

### Sharing must include the OSM relationship

**Do not answer blanket “no data shared.”** The map WebView connects directly to `tile.openstreetmap.org` automatically. OSMF explicitly identifies itself as an independent controller, not a processor acting on our instructions. Its privacy policy describes IP, device/browser/OS and request-path/time records. The service-provider exception therefore does not cover OSMF; no separate prominent map-sharing consent is implemented. Proposed Play treatment is **collected and shared** for network identifiers, map interactions, approximate location and diagnostics. [OSMF relationship](https://osmfoundation.org/wiki/Services_and_tile_users_privacy_FAQ), [OSMF automatic records](https://osmfoundation.org/wiki/Privacy_Policy#Personal_data_we_receive_automatically).

### OSM country and retention evidence

The provider's public infrastructure recipe installs and runs `ofastlylog` for Fastly tile logs. That processor's raster-tile tables inherit client IP, country, timezone, request time, user agent and network fingerprints; successful-request records additionally retain tile coordinates. Its README describes compressed logs deposited in S3 every ten minutes and processed into hourly Parquet partitions. This supports **retained country-level location**. The same schema retains HTTP response `status` and `ttfb` (time to first byte); these support the Diagnostics mapping and show retained response/performance records, beyond merely theoretical CDN inference. Evidence is public source/configuration, not a sample of an actual user's logs: [OSM deployment recipe](https://github.com/openstreetmap/chef/blob/6c30e6e46f220134f7b97326b91254dfa2ef95ef/cookbooks/tilelog/recipes/default.rb), [shared columns](https://github.com/pnorman/ofastlylog/blob/16ef11a3aff3455498c6580696d0cd1f7b68ecaf/ofastlylog/services/base.py#L72-L107), [raster table](https://github.com/pnorman/ofastlylog/blob/16ef11a3aff3455498c6580696d0cd1f7b68ecaf/ofastlylog/services/tile.py#L14-L52), [log architecture](https://github.com/pnorman/ofastlylog/blob/16ef11a3aff3455498c6580696d0cd1f7b68ecaf/README.md#L68-L80).

Store-category interpretation: country is Apple's Coarse Location and Google's Approximate location; Google explicitly includes IP-inferred location. Collection is automatic and non-ephemeral. OSM's stated operational, security and service-planning uses support the purpose selections above; no advertising or marketing purpose was found. The exact S3/CDN expiry period remains unpublished in the inspected sources, but it is unnecessary to invent a duration to answer “not ephemeral.” The six-hour processing lookback is not retention, and the privacy policy's 180 days applies to Piwik website analytics, not these tile logs. [Apple categories](https://developer.apple.com/app-store/app-privacy-details/), [Google categories](https://support.google.com/googleplay/android-developer/answer/10787469), [OSM purposes](https://osmfoundation.org/wiki/Privacy_Policy#Personal_data_we_receive_automatically).

Anthropic/Resend/hosting transfers may qualify for the service-provider or specific informed-user-action exceptions under Google's rules; do not extend those exceptions to an independent controller. AI processing and quote/report submission have separate consent flows. A final “shared” choice for contact/content categories must reflect the actual applicable terms and disclosure. WeatherKit receives a server request for fixed public destination coordinates, without the client's IP/contact/location headers. [Google sharing exceptions](https://support.google.com/googleplay/android-developer/answer/10787469).

## Verified diagnostics and remaining limits

- **Netlify metadata:** original website site `c97b6108-c09d-4cf9-88be-8439f69994c4` has a nonempty `SENTRY_DSN`, functions scope, context `all`; `NETLIFY_SENTRY_DSN` returned 404. The dedicated mobile site `f0fa9f3a-0de9-4e62-9809-d64031c415a2` returned 404 for both keys. Only presence/scope/context were reported; no values or tokens were logged.
- **Backend Sentry is configured:** `_sentry.mjs` activates from those DSN variables, sets `sendDefaultPii:false`, captures server exceptions/messages and adds endpoint/method/content type plus truncated upstream error bodies. Existing planner send/proxy code also writes upstream failure text to hosting console logs. This is not proof of anonymous diagnostics. Mark linked conservatively unless actual scrubbed event samples establish otherwise. No live event was triggered or inspected.
- **Backend trace scope remains unverified:** source defaults to a 0.1 trace sample rate, but an override and actual Sentry trace events were not checked. OSM status/TTFB records independently support Google Diagnostics; do not infer native Crash logs, other app-performance categories or an exact retention period. Corrected iOS build 3 bundled privacy manifests and Android code 4 permissions were inspected; their limited declarations do not remove actual server/provider data flows. Native source has no Sentry/analytics SDK.
- **Retention and model training:** Anthropic's current commercial API policy generally retains inputs/outputs for up to 30 days, with stated exceptions. Its training policy excludes commercial chats unless opted into the relevant programs/feedback. This account's agreement, opt-ins and any zero-retention exception were not inspected. Say non-ephemeral; do not promise zero retention or an account-specific no-training guarantee. [Anthropic API retention](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data), [commercial training policy](https://privacy.claude.com/en/articles/7996885-how-do-you-use-personal-data-in-model-training).
- **Network location/usage:** resolved to the conservative disclosure above using OSM's public tile-log implementation. Exact retention expiry remains unknown; no provider account or traffic logs were accessed.
- **Operational unknowns:** mailbox/Resend/hosting/Sentry retention settings, report/quote success in a controlled delivery check, named review-contact reachability, deletion fulfillment and the precise legal operator description remain separate from code verification. The published policy identifies Destination Paradise, Zanzibar, Tanzania and the company support address; this worksheet does not invent a registered corporate identity.

## Content-rating answers from current content

Verified store results: Apple calculated **13+**, saved without override. Google IARC completed/saved at **6 September 2026, 01:28 EAT**: ESRB Everyone (Alcohol Reference), PEGI 3, USK All ages, ClassInd All ages, Generic 3+. Google's saved questionnaire uses Rarely for downloaded-content alcohol references; other downloaded categories No; online content Yes (AI), online age categories No; miscellaneous No. Google target audience **18 and over** was subsequently saved; intended audience and calculated content ratings are separate fields.

| Form topic | Supported answer / recommendation |
| --- | --- |
| Apple Messaging and Chat | **No:** its definition concerns users communicating with one another. The private AI planner and quote request do not connect app users to peers. |
| Apple User-Generated Content / Social Media; Google user-to-user sharing | **No** for broad-distribution or peer-sharing capabilities. No public posts, profiles, feed, comments or shared chat exist. This does not remove chat/report text from privacy disclosures. |
| Unrestricted web access | **No:** the map WebView permits only its own document; approved attribution links and other external links open through the OS. No arbitrary in-app browser/address bar exists. Source: `../src/components/map/map-frame.tsx` and `map-protocol.ts`. |
| Alcohol references | Recommend **infrequent/mild references** where the questionnaire asks about references. The data includes Kae Funk Sunset Beach Bar, Dreamland Restaurant & Bar, Sagando Restaurant & Bar and Kameleon Blue Bar & Restaurant. Their descriptions concern dining/music/sunset; no explicit alcohol consumption, sales, tobacco or drug text was found in the mobile snapshot. Do not claim frequent use or an alcohol-selling app. |
| AI-generated content | **Yes, an AI text planner is present.** Private AI chat is distinct from peer messaging. Keep the existing in-app output-report flow; do not classify all app imagery as AI-generated because AI helped implement the app. |

The capability mappings follow [Apple's current definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/) and [Google's UGC definition](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en); the AI planner falls within [Google's AI-content policy scope](https://support.google.com/googleplay/android-developer/answer/14094294?hl=en). Alcohol frequency is a conservative interpretation of four venue names in `../src/data/generated-content.json`, not a claim of depicted consumption. Let the store questionnaire calculate the resulting age/region ratings. Family-trip preferences alone do not make this a children's app.

## Image and brand provenance

The 24 destination and eight food-area image URLs in `generated-content.json` all point to the existing Destination Paradise website asset library. `../scripts/sync-content.mjs` traces them to website content/product sources. Seven Zanzibar destination images have locality labels; 17 mainland images are explicitly marked representative. No new stock-photo source was introduced. `../../src/data/imageManifest.json` records dimensions, not authors or licences.

The Play icon is an unchanged copy of the approved website logo. The feature graphic is original AI-assisted vector artwork with no photographed or simulated app screen. Native captures are authentic screenshots; their provenance and the initial Android candidate's landscape issue are recorded in the capture manifests. See `assets/PLAY-ASSETS.md`, `assets/play-promotional-assets.json`, `assets/ios/capture-manifest.json` and `assets/android/capture-manifest.json`.

No conflicting rights claim was found. Source reuse establishes provenance, not copyright ownership: Apple's third-party-content rights answer was subsequently saved as Yes by the root publishing task. Source provenance alone does not establish a different legal owner or new rights agreement. There is no evidence here requiring a new photo purchase or blanket AI-image declaration.

## Apple EU trader status

The publishing agent observed an app-level **non-trader** default, while the existing Louis Peter account's DSA status is **In Review**, dated 5 September 2026. The account name and existing German legal address were verified in the account; private address details are not repeated here. The app promotes paid travel services and requests quote leads. Apple's factors include promoting services and acting in a business capacity, including individual developers. **Recommendation: trader for this app if distributed in the EU.** A free download and individual membership do not establish non-trader status. [Apple trader guidance](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/).

The pending owner decision is whether to use the **existing Louis Peter trader details already under review** for this app, or provide separate business details. Individual trader pages publish an address or P.O. Box, phone and email; the publishing agent has asked the owner which details to use. The company support values above are not automatically a substitute. Apple permits app-specific status, so preserve other apps' settings. No new account or purchase is needed; account trader verification remains distinct from the app's current status.

## Published policy clarification

The revised 7 September policy is live at the canonical URL, with canonical and immutable bytes matching source. It explains optional on-device Nearby location and bundled suggestion photos, while ordinary Explore/detail photos can load from the website. Existing OSMF independent-controller, retained country-level IP inference and operational/security/usage-analysis disclosures remain. No precise retention period or GPS collection is claimed. Exact deployment and SHA-256 evidence is in [PUBLISH_STATUS.md](PUBLISH_STATUS.md).

Live WeatherKit returned 200; marine returned 200/unavailable; report GET/OPTIONS returned 405/204 without email. All three mobile functions were preserved, with no environment or main-website deployment change. Policy publication did not change store settings or send an external message.
