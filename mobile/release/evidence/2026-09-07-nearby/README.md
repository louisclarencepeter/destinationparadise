# Nearby release evidence — 7 September 2026

Preserved on 8 September 2026 from the local release session's temporary files. These are historical observations from **7 September 2026**. Preservation verifies file integrity; it does not refresh Apple/Google status, prove public availability, or repeat native/device tests.

## Start here

| Evidence | Meaning and limits |
| --- | --- |
| [Apple distribution](version110-apple-processing-and-distribution.json) | iOS 1.1.0 (6) processing Complete, owner TestFlight Testing, saved App Store draft. Public review was not submitted. New-build owner installation was unverified; the last observed installation was 1.0.0 (4). |
| [Google Play distribution](version110-android-play-distribution.json) | Android 1.1.0 (8), internal release 5, available to selected internal testers, 12,477 phones / 6,690 tablets, zero lost devices. Owner installation was unverified; production was not released. |
| [Android code 6 QA](nearby-code6-native-qa.json) | Exact AAB-derived, locally signed APK on phone/tablet emulators. Native Stone Town recommendation success was recorded on the phone. Code 6 was held for the location-hardware compatibility regression. |
| [Android code 7 QA](nearby-code7-native-qa.json) | Optional hardware correction, emulator upgrade/cold launch/permission/denial/fallback/opt-out checks. Successful native acquisition was not repeated; prior code 6 evidence was retained. |
| [Android code 8 QA](nearby-code8-native-qa.json) | Emulator upgrade to 1.1.0 (8), displayed version, approximate permission, denial/fallback/opt-out checks. Successful native acquisition was not repeated. |
| [iOS build 5 failure](nearby-build5-apple-processing-failure.json) | Apple rejected build 5 for missing NSMotionUsageDescription (90683), after local static/signing checks had passed. |
| [iOS build 6 artifact](version110-ios-build6-artifact-verification.json), [signing](version110-ios-build6-signing-verification.json), [submission](version110-ios-build6-submission-verification.json) | Static identity/privacy/orientation checks, deep signing validation, Apple archive validation, and submission history. They do not establish device runtime. Later Apple distribution evidence supersedes the earlier processing-in-progress snapshot. |
| [Source manifest](dp-version-110-source-manifest.json), [source verification](version110-ios-build6-source-verification.json) | 111-file 1.1.0 build-source snapshot and the original verification report. Older code 6/7 manifests are also preserved. Current repository edits need separate validation. |
| [Artifact integrity](artifact-integrity-verification.json), [bundle comparison](android-runtime-bundle-comparison.json) | Recomputed on 8 September: all three AABs, three local test APKs, and two IPAs match recorded SHA-256/size values. Only codes 6 and 7 have identical Hermes bundles; code 8 differs. |

## Corrections to the original handoff

Android codes **6 and 7**, not codes 7 and 8, contain identical Hermes bundles (`ec5e3a7396735a2b94903fda93ca24b5bd1616ea8e1c98c6c642ee165652f5ec`, 2,863,184 bytes). Code 8 contains `abb6fabddc5673367673d62484679ac6190924dfd96f3eadbd13a0268a08a3f0` (2,869,100 bytes). The five Nearby source files listed in code 8's QA report match code 7's source-manifest hashes. Code 6 success is prior evidence, and was not repeated on code 8.

iOS build 6 physical installation is **unverified**, not confirmed absent. The Apple snapshot records build 4 as the last observed installation and `ownerInstalledNewBuildVerified: false`.

## Selected screenshots

Six original, visually inspected PNGs are preserved in [screenshots/](screenshots/): code 6 Stone Town success; code 7 tablet approximate-only permission; code 8 phone approximate-only permission; code 8 phone/tablet version footers; and code 8 tablet manual map fallback. Every selected image's SHA-256 and size matches its original native-QA report. The other image paths in historical reports identify uncopied temporary originals.

## Provenance and redaction

[preservation-manifest.json](preservation-manifest.json) is the complete index of original paths, original SHA-256/size, preserved relative paths, preserved SHA-256/size, and transformations. Historical JSON files otherwise retain their exact bytes and original `/tmp` references. Resolve a referenced filename here through the manifest; a `/tmp` path is not a durable link.

Two JSON files were transformed: the iOS build 6 submission report replaces one credential key identifier with `[REDACTED credential identifier]`; the Google Play report replaces two unrelated tester-list names while retaining counts and selection state. Formatting was normalized for those two files. The manifest retains both original and preserved hashes. No token, private key, signed download URL, credential file, raw EAS/provider response, tester CSV, download script, or full native binary was copied. Key-cleanup evidence records booleans only; credential files were not accessed.

The three AABs, three local APKs and two IPAs remain outside Git; their exact file hashes are preserved. Source-manifest entries are file paths/hashes, not copies of the release source archives. This folder is a curated evidence set, not a complete archive of `/tmp/dp-native-release/`.

To check preserved contents without the original temporary files, run from this directory:

```sh
python3 - <<'PY'
from pathlib import Path
import hashlib, json
manifest = json.loads(Path('preservation-manifest.json').read_text())
for entry in manifest['files'] + manifest['generatedFiles']:
    data = Path(entry['preservedPath']).read_bytes()
    assert len(data) == entry['preservedBytes'], entry['preservedPath']
    assert hashlib.sha256(data).hexdigest() == entry['preservedSha256'], entry['preservedPath']
print('All indexed evidence hashes and sizes match.')
PY
```

The manifest excludes its own checksum to avoid self-reference. Git preserves that file's history alongside the other evidence.
