# Near me source candidate evidence — 11 September 2026

These receipts establish source validation and read-only provider observations for the 1.1.1 candidate. They do not establish a new signed build, store upload, device installation or publication.

- `validation.json`: final source checks, isolated synthetic UI checks and read-only backend preflight.
- `provider-state.json` / `eas-builds.json`: authenticated EAS and Apple readback, with no secrets or signed artifact URLs.
- `native-introspection-summary.json`: Expo native configuration; Android `remove` directives are intentionally distinguished from granted/merged permissions.
- `tile-analysis.json`: synthetic requested-area geometry and explicitly conditional map-center inference. This measures request information, not GPS accuracy or observed provider profiling.

Complete local scripts, export, screenshots, network receipts and logs remain in the task workspace `work/dp-nearby-release-20260911/`. No real user coordinates, token, key, credential file or store write is included here.
