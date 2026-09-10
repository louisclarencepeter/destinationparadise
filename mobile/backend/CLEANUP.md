# Temporary deployment cleanup

Prepared 2026-09-05; execution outcome recorded below. Re-read provider state immediately before any future cleanup. All URLs below are relative to `https://api.netlify.com/api/v1` and use the existing authenticated account; never log credentials or environment values.

## Verified execution outcome

Cleanup completed at **2026-09-05 20:58:59 UTC** with the following bounded outcome:

- Removed the four original-site-only WeatherKit keys listed below. Each exact `DELETE` returned HTTP 204, and each following exact old-site `GET` returned HTTP 404. Their original timestamps, scopes, contexts, and secret flags were rechecked immediately before each removal.
- Preserved all seven standalone-site environment entries and all **15 other original-site environment entries**. Full provider representations were compared in memory before and after; no environment values were logged or written to evidence.
- Preserved original published deploy `6a8dbf35cb01b33e235abc4b` and standalone production deploy `6a9c808c5bf2edc8e8dfa90a`. Both site publication pointers were checked throughout and after cleanup.
- Canonical mobile weather returned HTTP 200 before and after cleanup, with `source: "Apple Weather"` and `current.asOf: "2026-09-05T20:51:08Z"`. Original website planner `GET` remained HTTP 405. No planner-send or report submission was made.
- **Both unpublished candidates remain.** The first site-scoped deletion attempt for original draft `6a9c7bf73fad91136a2e1035` returned HTTP 405. Cleanup stopped at that response. Subsequent authorization limited further work to the four environment keys; no alternate delete endpoint, cancellation, or deletion of branch candidate `6a9c7fc986e46cb59fc0eaf7` was attempted. Final reads confirmed both candidates still had `published_at: null` with their previously recorded states.

The environment cleanup is complete. The deploy deletion steps below are retained as investigation history, **not instructions to retry**. The original draft's HTTP 405 does not establish its cause; no undocumented workaround was attempted.

Redacted machine evidence: `/tmp/dp-mobile-cleanup-20260905-evidence.json` records the stopped draft attempt; `/tmp/dp-mobile-env-cleanup-20260905-evidence.json` records all four successful removals and final checks. These temporary files contain only IDs, key names, status codes, timestamps, and check results.

## Protected resources

| Resource | Required value |
| --- | --- |
| Original website site | `c97b6108-c09d-4cf9-88be-8439f69994c4` |
| Original website published deploy | `6a8dbf35cb01b33e235abc4b` — never delete or replace |
| Standalone mobile site | `f0fa9f3a-0de9-4e62-9809-d64031c415a2` |
| Account | `63fdd2e141224b0084aa509a` |

Start only after the standalone site's new production deployment is ready and live. `GET /sites/f0fa9f3a-0de9-4e62-9809-d64031c415a2` must identify the intended production deploy as `published_deploy.id`; `GET /deploys/{that_id}` must have matching `site_id`, `state: "ready"`, `context: "production"`, and non-null `published_at`. Record that ID as protected for all following checks.

The canonical `GET https://destination-paradise-mobile.netlify.app/api/weather` must return HTTP 200 with the expected Apple Weather payload. Confirm this before removing any temporary resource, then again afterward. A successful build or immutable preview URL alone does not satisfy this gate.

Also require `GET /sites/c97b6108-c09d-4cf9-88be-8439f69994c4` to report the protected original published deploy above. Abort if either site's published ID changes during cleanup.

## Unpublished candidates

These are the only deploy IDs eligible for this cleanup:

| Candidate | Site | Last observed state | Reason unused |
| --- | --- | --- | --- |
| `6a9c7bf73fad91136a2e1035` | Original website | `prepared`, `deploy-preview`, `published_at: null` | Additive draft stopped because original function archives could not be recovered exactly. |
| `6a9c7fc986e46cb59fc0eaf7` | Standalone mobile | `ready`, `branch-deploy`, `published_at: null` | Explicit `branch: "main"` acted as an alias on this manual site; production environment was not selected. Corrected creation omits `branch`. |

Before each deletion, `GET /deploys/{candidate_id}` must match the exact candidate/site pair, have `published_at: null`, and differ from both protected published IDs. Check the corresponding site again to ensure the candidate is not current. Do not infer eligibility from its title or deploy context alone.

Use Netlify's site-scoped `deleteSiteDeploy` operation, with no body:

```text
DELETE /sites/c97b6108-c09d-4cf9-88be-8439f69994c4/deploys/6a9c7bf73fad91136a2e1035
DELETE /sites/f0fa9f3a-0de9-4e62-9809-d64031c415a2/deploys/6a9c7fc986e46cb59fc0eaf7
```

Success is HTTP 204 with no JSON body. Verify each exact `GET /deploys/{candidate_id}` now returns 404. If the provider requires cancellation for an actively running candidate, the documented operation is `POST /deploys/{candidate_id}/cancel` with no body, returning HTTP 201 and deploy JSON; recheck the same candidate/site/publication guards before and after cancellation. Do not cancel any protected deployment or automatically broaden a failed deletion.

## Original-site-only temporary environment variables

Remove only these four exact keys from the **original** site after the live-production gate. Each was created during this release with `scopes: ["functions"]` and production context. Their last observed metadata is below; environment values must remain out of output.

| Key | `is_secret` | Last observed `updated_at` (UTC) |
| --- | --- | --- |
| `WEATHERKIT_TEAM_ID` | `false` | `2026-09-05T20:20:18Z` |
| `WEATHERKIT_SERVICE_ID` | `false` | `2026-09-05T20:20:21Z` |
| `WEATHERKIT_KEY_ID` | `false` | `2026-09-05T20:20:26Z` |
| `WEATHERKIT_PRIVATE_KEY` | `true` | `2026-09-05T20:20:47Z` |

First read each key with the exact old-site `site_id` query. Require this metadata to match; stop for review if there are additional contexts, changed scopes/timestamps, or any other evidence of intervening use. Independently verify the standalone site's seven required keys remain available in functions/production scope, with `WEATHERKIT_PRIVATE_KEY` and `RESEND_API_KEY` secret. Do not print secret values, copy old Resend credentials, or delete account-wide variables.

Use Netlify's `deleteEnvVar` operation. The `site_id` query is mandatory for this cleanup even though the API schema makes it optional. No request body:

```text
DELETE /accounts/63fdd2e141224b0084aa509a/env/WEATHERKIT_TEAM_ID?site_id=c97b6108-c09d-4cf9-88be-8439f69994c4
DELETE /accounts/63fdd2e141224b0084aa509a/env/WEATHERKIT_SERVICE_ID?site_id=c97b6108-c09d-4cf9-88be-8439f69994c4
DELETE /accounts/63fdd2e141224b0084aa509a/env/WEATHERKIT_KEY_ID?site_id=c97b6108-c09d-4cf9-88be-8439f69994c4
DELETE /accounts/63fdd2e141224b0084aa509a/env/WEATHERKIT_PRIVATE_KEY?site_id=c97b6108-c09d-4cf9-88be-8439f69994c4
```

Success is HTTP 204 with no JSON body. Re-read each old-site key and require 404. Preserve the standalone site's equivalents and every original planner/Resend variable. Finish by verifying both protected published IDs, the standalone site's seven required environment keys, and canonical weather HTTP 200. A read-only original `GET https://yournexttriptoparadise.com/api/planner` should remain HTTP 405; do not submit quote or report emails for cleanup validation.

## Source

Verified against the installed official Netlify OpenAPI schema at `/opt/homebrew/lib/node_modules/netlify-cli/node_modules/@netlify/open-api/dist/swagger.json` and the provider's [deleteSiteDeploy](https://open-api.netlify.com/#operation/deleteSiteDeploy), [cancelSiteDeploy](https://open-api.netlify.com/#operation/cancelSiteDeploy), and [deleteEnvVar](https://open-api.netlify.com/#operation/deleteEnvVar) reference. General authentication and request guidance is in [Netlify's API guide](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/).
