# Mobile source reconciliation — 8 September 2026

The ten mobile commits were replayed in order onto `origin/development` at
`fb3b9489` in an isolated worktree. The existing remote website history is
preserved. The primary checkout's nine older website commits and unfinished
website changes were not included in this transfer or modified.

`mobile/HANDOFF.md`, the existing `design/mobile-app/` export, and the selected
[release evidence](evidence/2026-09-07-nearby/README.md) are tracked with the mobile
source. The design export is archived as received; it is separate from the Expo
application and is not part of the website bundle or EAS build.

The archive's existing README references ZIPs under `docs/`. Those are original
local provenance paths, not committed files. The extracted design files are the
preserved repository artifact; the export itself was not rewritten.

## Commit mapping

| Original local commit | Reconciled commit | Change |
| --- | --- | --- |
| `c749b888` | `fb45b7e2` | feat(mobile): prepare Destination Paradise app with WeatherKit |
| `552d7ce8` | `5974d5c2` | fix(mobile): correct weather rotation and record store release setup |
| `95eea721` | `07720dcf` | docs(mobile): record approved store name and internal release |
| `ddea9f0a` | `a0f6b11b` | docs(mobile): record TestFlight invitation recovery |
| `8d686adc` | `86e1393c` | Apply approved full-logo navy mobile app icon |
| `04e6eb30` | `63d9ce8f` | feat(mobile): suggest nearby trips using optional on-device location |
| `cc6b32c1` | `2bc5e6df` | fix(mobile): keep location hardware optional on Android |
| `04e009df` | `362a9ac2` | docs(mobile): record nearby private release and validation |
| `2b92765c` | `46fad773` | fix(mobile): publish accurate 1.1.0 versions and iOS privacy description |
| `d9c2e575` | `701db547` | docs(mobile): record verified 1.1.0 private releases |

The published private iOS `1.1.0 (6)` and Android `1.1.0 (8)` binaries still map to
original runtime commit `2b92765c`; its transferred equivalent is `46fad773`.
The preserved source-freeze manifest documents those existing binaries.

## Integration corrections

- Regenerated the mobile content snapshot from the authoritative remote website
  sources. Four provenance hashes and the Mnemba photo label changed; destination
  counts, coordinates, related trips, food/events and season data are unchanged.
- Explicitly included `expo/types` in the mobile TypeScript configuration. A clean
  dependency installation exposed a missing web type augmentation that the primary
  machine's ignored, generated `expo-env.d.ts` had supplied. Runtime component
  behavior and native permissions are unchanged.
- Added a dedicated mobile CI job using the locked mobile dependencies, Expo
  compatibility check, content check, TypeScript, 79 tests, and all-platform export.
  The existing required `verify` job explicitly fails if mobile does not succeed.
- Excluded the mobile `node:test` suite and archived prototype from root Vitest.
  Root tests still include the mobile backend's 24 tests under `test/netlify/`.
- Corrected the handoff's code 7/code 8 bundle-equivalence statement and distinguished
  unverified iOS installation from proof of non-installation.

## Verification

Validation was performed from the isolated worktree with fresh `npm ci`
installations at both repository root and `mobile/`:

- Root: lint, typecheck, **195/195 tests**, production build and **124/124**
  prerendered routes passed.
- Mobile: content consistency, typecheck, **79/79 tests**, Expo dependency
  compatibility, **21/21 Expo Doctor checks**, and iOS/Android/web exports passed.
- CI configuration: `actionlint` and JavaScript configuration syntax passed.
- Release evidence: see its index for original/copy hashes and redactions.

The repository reconciliation does not establish fresh store-console state,
physical installation of build 6/code 8, or a new store release. Existing store
observations are dated 7 September. The current source includes the integration
corrections above; no replacement signed binary was built or submitted.

## Continuing work safely

Use current `origin/development` for new shared work. The primary checkout at
`/Users/louisclarencepetersgmail.com/Projects/destinationparadise` remains on its
historical local `development` with the user's unfinished website edits. Its raw
ahead/behind counts include old commit identities even though the ten mobile
patches are now retained under the reconciled identities above. Do not push that
checkout wholesale. Reconciling the remaining website work is a separate task.

Temporary integration branches must be removed after merging into `development`.
Keep `main` unchanged and create no `development` → `main` PR without an explicit
user request. Keep provider submissions and physical-device QA separate from Git
and CI verification.
