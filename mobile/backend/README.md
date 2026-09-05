# Standalone mobile backend

This package deploys only Destination Paradise's mobile weather, AI-content reports, and privacy page. The website, AI planner generation, quote delivery, and existing website functions stay on their existing project.

Target project is pinned in the build and deployment scripts:

- Site ID: `f0fa9f3a-0de9-4e62-9809-d64031c415a2`
- URL: `https://destination-paradise-mobile.netlify.app`
- Team: `louisclarencepeter`, account `63fdd2e141224b0084aa509a`

## Build locally

Requires Node.js 22.13 or newer. From `mobile/backend`:

```sh
npm ci --ignore-scripts
npm run build
```

The lockfile pins build dependencies. `build.mjs` bundles each of the three named handlers individually with Netlify's official bundler; it never scans the website function directory for other deployable functions and never runs the website build. It accepts only those handlers and their two shared source dependencies.

Generated, ignored output:

```text
build/
  public/
    _headers
    mobile-privacy.html
  functions/
    marine.zip
    planner-report.zip
    weather.zip
  manifest.json
```

The privacy page is copied from `mobile/release/mobile-privacy.html`; the build rejects an outdated canonical URL. The manifest records source SHA256 hashes, upload SHA1 hashes for files, raw SHA256 hashes for ZIPs, Node.js 22 runtime, and explicit API routes. Two consecutive clean builds were verified to produce identical manifests and ZIP hashes. No credentials enter the artifact.

## Runtime variables

Set these on the **new mobile project**, in the `functions` scope and `production` context. Do not put values in this directory, a public Expo environment variable, source control, or a command-line argument.

| Variable | Setting |
| --- | --- |
| `WEATHERKIT_TEAM_ID` | `86ZX7JC345` |
| `WEATHERKIT_SERVICE_ID` | `com.yournexttriptoparadise.weather` |
| `WEATHERKIT_KEY_ID` | `96737N7WB9` |
| `WEATHERKIT_PRIVATE_KEY` | Existing authorized WeatherKit P-256 key; secret |
| `RESEND_API_KEY` | Sending key restricted to `mail.yournexttriptoparadise.com`; secret |
| `RESEND_FROM_PLANNER` | `Destination Paradise <booking@mail.yournexttriptoparadise.com>` |
| `TEAM_EMAIL_PLANNER` | `info@yournexttriptoparadise.com` |

Use an explicit API `site_id` when configuring variables. In this repository, the Netlify CLI's linked-site resolution previously selected the website even when an environment command was given `--site`; do not rely on that flag for this operation.

Official API creation uses `POST /accounts/63fdd2e141224b0084aa509a/env?site_id=f0fa9f3a-0de9-4e62-9809-d64031c415a2`, with an array of `{ key, scopes: ['functions'], is_secret, values: [{ context: 'production', value }] }` objects. Keep secret values in memory, read from their authorized secure source. The scripts here never set environment variables.

## Deployment

Authenticate the Netlify CLI, or supply `NETLIFY_AUTH_TOKEN` through a secure environment. From the repository root:

```sh
node mobile/backend/deploy.mjs preflight
```

Preflight is read-only. It checks the complete artifact allowlist and hashes, source freshness, exact target project/team, required production variable metadata, and the unchanged website's published ID. It does not read or print private environment values.

Only after those checks, explicitly publish the **mobile backend**:

```sh
node mobile/backend/deploy.mjs deploy --production
```

This creates a production deployment through the API with only two files and three function digests, uploads the requested known artifacts, and verifies the resulting published ID, static-file hashes, function names/routes/runtime, and unchanged website ID. The production context uses the new project's production variables; no draft-variable copy is needed. It never relies on `.netlify/state.json`, never deploys the root website, and cannot create a site or modify environment settings.

The new deploy ID is printed and saved to `build/deploy-id.txt` immediately. If an upload or polling call times out, keep the artifact and resume the same deployment:

```sh
node mobile/backend/deploy.mjs resume DEPLOY_ID
node mobile/backend/deploy.mjs verify DEPLOY_ID
```

Do not rebuild between an interrupted deployment and its resume. Source changes require a new reviewed artifact. `verify` checks provider metadata and publication, and is read-only.

## Live checks

After deployment, verify these URLs on the new site:

- `/mobile-privacy.html`: HTTP 200 after any normal pretty-URL redirect, correct page and canonical URL.
- `/api/weather`: Apple WeatherKit response, observation time, and attribution.
- `/api/marine`: honest null/unavailable result, with no upstream marine call.
- `GET /api/planner-report`: HTTP 405.
- `OPTIONS /api/planner-report` from the exact new origin: HTTP 204 with that origin in the CORS header. Unrecognized origins remain rejected.

Do not send a valid report as a health check: it sends a real team email. The report's provider-accepted path is covered with mocks. A complete real moderation delivery check needs separate authorization for that message.

The new project intentionally does not contain the website, planner generation, quote sending, or website edge functions. It does not redirect all routes to an app shell. The native app continues to call the website for planner generation and quote submission.

## Validation

```sh
npx vitest run test/netlify/planner-report.test.mjs test/netlify/weather-proxy.test.mjs
npx eslint netlify/functions/planner-report.mjs
```

Run those commands from the repository root. The 24 backend tests passed after the origin addition. An additional mocked check allowed the exact new origin and rejected a lookalike hostname without sending email.

## References

- [Netlify API deployment protocol](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/)
- [Netlify environment variable API](https://open-api.netlify.com/#operation/createEnvVars)
- [Netlify configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/)

The existing website preservation baseline for this release is deploy `6a8dbf35cb01b33e235abc4b`. Its earlier attempted additive draft `6a9c7bf73fad91136a2e1035` must remain unpublished because original function archives could not be recovered. This standalone package avoids that dependency entirely.
