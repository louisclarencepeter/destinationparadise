# Handoff — Automation Health Check (2026-07-20)

Findings from a GitHub Actions health check (no APM/incident-monitoring service is connected to this repo, so CI/scheduled-workflow history was used as the signal). Nothing is currently failing, but two issues are worth fixing so they don't recur.

## To fix

### 1. Instagram Story publish can reject media outright (data bug, not transient)
- **Where:** `scripts/instagram-story.mjs` (`Daily Instagram Story` workflow)
- **Failed run:** [29634898086](https://github.com/louisclarencepeter/destinationparadise/actions/runs/29634898086) — 2026-07-18 06:57 UTC
- **Error:** Meta Graph API rejected the upload: `"Only photo or video can be accepted as media type."` (code `9004`, subcode `2207052`)
- **Why it matters:** this is a content/format problem, not a network blip — `fetchWithSafeRetries` (hardened in PR #79 for 408/429/5xx) won't catch it, since Meta returned a normal error response, not a transient failure. The job failed the whole run rather than skipping the bad asset and continuing.
- **Did not recur** on the next two scheduled runs (07-19, 07-20), so whatever item was queued that day is no longer at the front of the queue — the underlying bad asset may still be sitting later in the media library.
- **Suggested fix:** validate media MIME type/extension before calling the publish API (fail fast with a clear log line naming the offending file), and/or audit the story media queue for any non-photo/video files that could resurface this error on a later run.

### 2. Threads Auto Commenter has intermittent same-day failures
- **Where:** `Threads Auto Commenter` workflow
- **Failed runs:** [29536479874](https://github.com/louisclarencepeter/destinationparadise/actions/runs/29536479874), [29535570483](https://github.com/louisclarencepeter/destinationparadise/actions/runs/29535570483) — both 2026-07-16, ~21:19–21:33 UTC
- **Behavior:** failed twice back-to-back, then succeeded on a later run the same day (21:34 UTC) with no code change in between.
- **Suggested fix:** pull the job logs for those two run IDs to confirm the failure mode (likely a rate-limit or transient API error given it self-cleared); if it's a retryable class of error, add it to the existing retry helper the same way 408/429/5xx was added for the Instagram script.

## Not an issue — no action needed
- Two `CI` failures on `development` (2026-07-17, ~14:44 UTC) were normal pre-merge churn during PR #79 iteration; PR #79 merged clean to `main` shortly after and is closed/merged.

## Not checked (no connector available)
- No Sentry/Datadog/PagerDuty/StatusPage-style connector is linked to this account, so application error rates, latency, and resource usage were not observable in this check — only GitHub Actions history.
