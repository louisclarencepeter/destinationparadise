# Near me 1.1.1 source release candidate — 11 September 2026

## Ready source

The requested TestFlight feedback is implemented: a map location activator opens an explanation before opt-in; Near me displays the approximate position with nearby destination pins; list view is explicit. Refresh, recenter without reacquisition, composed filters, no-match recovery, denial, cancellation, outside-coverage fallback and turn-off are retained. The location marker is non-interactive so an overlapping destination pin remains tappable. Frame teardown permits only local data-image cleanup; HTTP/WebSocket connections remain disallowed by the map CSP.

Marketing version is **1.1.1 on both platforms**. This avoids regressing the existing Android 1.1.1/code 9 artifact. Expo SDK 57 and the already integrated Android shrinking/optimization remain in place. EAS remote build counters and auto-increment are unchanged; no replacement build number is invented.

The standalone backend captures the website's current published ID at release start, saves it before the first mutation, and compares it at the end. Its receipt binds the original baseline to the exact manifest and mobile deploy ID; resume/verify cannot recapture a newer website or accept mismatched artifacts. An uncertain creation response retains the baseline and blocks blind duplicate publication. The existing site/account, two-static-file, three-function, runtime and mutation-target allowlists remain enforced.

## Final validation

- **91 mobile tests**, TypeScript, content consistency and Expo dependency checks passed; **Doctor 21/21**.
- iOS, Android and web production exports passed. Native introspection retains reduced/default When In Use location, the required Motion purpose text, optional Android location hardware and all fine/background/overlay/storage removal directives. Signed-binary verification is still separate.
- **73 synthetic UI checks across seven scenarios** passed: phone, short landscape, tablet, tile-boundary coordinates, outside coverage, permission denial and cancellation/late result. The phone flow also verifies overlapping-pin details and no-match filter recovery. Console/page errors were empty. All external tile/photo requests were intercepted, so these tests sent no synthetic location to a provider.
- The xcode build tool generated 1,000 unique valid project IDs with the patched CommonJS UUID API; Expo native introspection passed using the same dependency tree.
- Both mobile and backend `npm audit` report **zero vulnerabilities**. `xcode` has a scoped `uuid@11.1.1` override. Backend tooling is pinned to `@netlify/dev-utils@6.0.1` and `@netlify/zip-it-and-ship-it@15.5.1`, using `toml@4.2.0` and `esbuild@0.28.1`; this also removes the newly detected vulnerable image-size chain. No unsupported Expo/RN upgrade or audit-force downgrade was used.
- Backend bundling passed with exactly two files and three functions. Three focused website-preservation tests passed, including changed website, changed target, changed artifact, mismatched/missing resume receipt, interrupted creation and duplicate-record rejection. Read-only live preflight passed against website deploy `6aa3271bc9017000085331a1`, unchanged at the end. No valid report request/email or provider mutation was sent.

See [the redacted evidence index](evidence/2026-09-11-nearby-source/README.md).

## Provider state and preserved work

Authenticated readback at **2026-09-10 21:53 UTC / 11 September 00:53 EAT** confirmed Apple app `6809042574`, version **1.1.0**, is **WAITING_FOR_REVIEW** with valid build **6** attached. The existing internal owner group remains present. The review/build attachment was not changed. Owner feedback from 9 September establishes use of build 6 on an iPhone 15 Pro Max; older build-4-only installation notes are superseded, but complete new-feature device QA is not established.

EAS's newest Android artifact is **1.1.1 (9)**, build `f51d0c5d-605e-4fbc-9137-f32d89a4c28b`, finished 9 September. Its recorded build message identifies frozen code 8 plus optimization commit `0ee33eff`; that optimization is already in development. EAS shows no submissions for code 9, which does not rule out a separate manual Play upload. The newest iOS EAS/Apple artifact remains **1.1.0 (6)**. Both platforms have existing EAS signing credentials; an Apple submission API key is available. No Google Play submission service account is configured for this EAS project. With the Mac GUI locked, current Play track/review/audience status remains unverified; the 7 September code-8/internal-release-5 record is historical.

The original working checkout and unrelated `-.jpg` / old project issues handoff were not edited by this candidate preparation. The 13 reviewed mobile paths were copied into an isolated worktree before the additional fixes above. Web release integration is owned by the parent task; this candidate changes only mobile paths.

## Privacy assessment before distribution

Coordinate values remain in memory and traverse only the local map bridge; only the enabled preference is stored. This does **not** make the map flow entirely on-device: OSM requests encode the viewed area. At zoom 17, synthetic scenarios requested rectangles approximately **0.55–1.11 km²**, with roughly 304 m tile sides in Tanzania. A conditional observer model using known viewport dimensions and a centered sequence of zooms further narrows the map-center range. Those are geometric information bounds, not measurements of actual device accuracy or claims about OSM's downstream profiling.

The older country-level Coarse/Approximate Location rationale is insufficient by itself for the new map flow. Google defines precise physical-location information below 3 km²; Apple compares resolution with coordinates having three or more decimal places. Permission names, a 150 m displayed accuracy floor and three-decimal local rounding do not independently settle how location-derived requests should be declared. Before distributing 1.1.1, review the returned-fix accuracy and final native requests and conservatively include **Precise Location** for derived map information where applicable, retaining the existing coarse/network collection and sharing purposes. No Apple/Google declarations were changed by this task. [Google data types](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [Apple definitions](https://developer.apple.com/app-store/app-privacy-details/).

Native source identifies the app in its WebView user agent and preserves visible OSM attribution, normal platform caching, and HTTPS tile URLs. No offline/bulk prefetch exists. The separate sandboxed **web export** emits no Referer in isolated Chromium, so it is a QA preview and needs a compliant tile identification arrangement before any public web-app release. This does not change the active travel website or establish native header behavior; verify the exact native binary's headers/cache as part of device QA. [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/).

The source privacy page describes the new map flow. The public policy was last verified on 11 September EAT as the older 7 September policy (SHA256 `1ce162735435379f5972bd7ead12cbcbfc4eb111529b4ad84680d9f448843788`), which still says Nearby does not add a current-location pin. Publish the corresponding standalone policy with website-preservation verification before replacement-binary distribution; local edits do not update that public page.

## Remaining release steps

1. Integrate this committed source through development and freeze the exact EAS archive. Preserve the current Apple 1.1.0 review.
2. Build replacement signed 1.1.1 artifacts using the existing EAS credentials/plan and remote counters, without auto-submission. Inspect exact IPA/AAB identity, version, signing, purpose strings, permission merger results, source fingerprint and optimization output.
3. Validate the exact replacement binary on native phone/tablet targets, including real foreground location, denial/settings/cancellation, opt-out/relaunch and map request metadata. The synthetic export checks do not replace this gate.
4. Reconcile store disclosures and publish/verify the matching policy. Refresh Play state before selecting the replacement private track/audience. Store publication, review withdrawal, tester additions and email delivery checks remain separate authorized actions; none occurred here.
