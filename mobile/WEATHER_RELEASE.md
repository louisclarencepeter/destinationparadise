# Apple Weather activation

Updated 5 September 2026. The app uses Apple WeatherKit through the dedicated Destination Paradise mobile backend at `https://destination-paradise-mobile.netlify.app`. The user cancelled the proposed Open-Meteo purchase; no new weather subscription is required.

Root verified the existing Apple Developer team's WeatherKit usage screen: 500,000 monthly calls included, 0 used at the initial check, 500,000 remaining. Root then configured the WeatherKit identifier/key and successfully invoked the new handler against Apple: HTTP 200 with an actual source timestamp of `2026-09-05T20:19:21Z`. Root also confirmed all four WeatherKit environment variables had been configured on Netlify before the backend move. Their availability on the dedicated mobile site, endpoint deployment and installed-release verification must be confirmed separately.

## Account and server configuration

The REST integration uses a registered Services ID and a private key with WeatherKit enabled. Apple documents that all registered Services IDs are eligible for WeatherKit. A separate native WeatherKit entitlement is unnecessary for this implementation because both iOS and Android use the server REST adapter. [Apple setup instructions](https://developer.apple.com/help/account/capabilities/create-a-services-identifier-and-private-key-for-weatherkit)

Configure these values only on the backend:

| Netlify environment name | Value |
| --- | --- |
| `WEATHERKIT_TEAM_ID` | `86ZX7JC345` |
| `WEATHERKIT_SERVICE_ID` | `com.yournexttriptoparadise.weather` |
| `WEATHERKIT_KEY_ID` | `96737N7WB9` |
| `WEATHERKIT_PRIVATE_KEY` | Downloaded `.p8` key as PEM, stored as a secret |

The identifiers are public metadata; the private key is not included here. Use the Functions scope and intended deployment context. Never put the private key or signed tokens in an Expo variable, app bundle, source control, client response or log. The server accepts literal PEM newlines or escaped `\n` separators.

The adapter signs a ten-minute ES256 JWT using Node's built-in cryptography. Its header is `{alg,kid,id}` and its claims are `{iss,iat,exp,sub}`, with `id` composed from the Team ID and Services ID. JWT signatures use IEEE-P1363 R||S encoding. [Apple authentication documentation](https://developer.apple.com/documentation/weatherkitrestapi/request-authentication-for-weatherkit-rest-api)

## Implemented flow

- The app requests `https://destination-paradise-mobile.netlify.app/api/weather`. Browser preview uses the equivalent same-origin path, routed by Metro to the dedicated mobile backend.
- The dedicated backend also serves `/api/marine`, `/api/planner-report` and `/mobile-privacy.html`. Planner chat and draft sending stay on the existing website's `/api/planner` and `/api/planner-send` endpoints.
- App and Metro origins share `src/config/endpoint-origins.json`; its TypeScript wrapper supplies the native API and privacy-link constants.
- `netlify/functions/weather.mjs` delegates to `_weather_proxy.mjs`.
- The server sends a Bearer JWT to `weatherkit.apple.com/api/v1/weather/en/-6.222/39.224`, requesting `currentWeather,forecastDaily` in `Africa/Dar_es_Salaam`.
- The server returns only atmospheric fields, their original `asOf` timestamp, the matching Zanzibar day's sunrise/sunset, and source attribution.
- The client formats solar times in EAT, converts relative humidity from a fraction to a percentage, and maps known Apple condition codes to the existing decorative scenes. Unknown conditions do not fabricate rain or a sun/moon.
- No device location permission or coordinates are collected. The fixed destination is Zanzibar.
- The app does not request `/api/marine`. That compatibility route returns explicit unavailable/null values without contacting another provider. Apple Weather does not provide sea surface temperature.
- The old public Open-Meteo defaults and paid proxy implementation have been removed.

The optional public app build override is:

```dotenv
EXPO_PUBLIC_WEATHER_FORECAST_URL=https://destination-paradise-mobile.netlify.app/api/weather
```

No marine override is required.

## Caching, errors and attribution

Successful responses use a 60-second client cache and a 600-second Netlify durable cache with 60 seconds of background revalidation. The original weather timestamp stays visible; `fetchedAt` does not replace it. Query-bearing legacy URLs redirect to the canonical query-free route before any Apple request. Fixed coordinates and fields prevent this from becoming an arbitrary upstream proxy. Netlify durable caching is eventually consistent, so it reduces calls but is not an absolute quota cap. [Netlify cache documentation](https://docs.netlify.com/build/caching/caching-overview/)

Unconfigured or invalid signing credentials produce 503. Upstream or malformed responses produce 502; an eight-second timeout produces 504. Failures are not cached. No paid or public third-party fallback is attempted, and credentials, tokens, upstream headers and diagnostic bodies are not exposed or logged.

The dark Apple Weather trademark asset is bundled at `assets/apple-weather-dark.png`, obtained from the official public [attribution API](https://weatherkit.apple.com/attribution/en), whose `logoDark@3x` field pointed to Apple's white PNG. It is unchanged. No remote logo request occurs when rendering weather. The Weather screen displays that mark and a deliberate link to [Apple's legal attribution and data sources](https://developer.apple.com/weatherkit/data-source-attribution/).

## Remaining release verification

1. Configure the required backend environment values and deploy the dedicated mobile functions/privacy page to `destination-paradise-mobile.netlify.app`; deployment of this new site is separate from the existing website.
2. Verify canonical `/api/weather` returns real Apple data and confirm the source timestamp, solar day, humidity and day/night state. Verify cached responses and failure behavior without printing secrets.
3. Build and install iOS/Android release artifacts. Confirm live conditions and the bundled Apple trademark/legal link render correctly, with sea temperature marked unavailable.
4. If activation cannot be completed, the user has authorized temporarily suspending live weather. Keep the monthly seasonal guide available; do not show sample weather as current.

## Local validation

- 18 mocked backend tests cover cryptographic signature verification, exact JWT claims, credential absence, fixed Apple requests, query normalization, timestamp/date selection, missing fields, error redaction and timeouts.
- 7 client tests cover timezone preservation, source validation, condition mappings, missing marine values, one controlled request and cancellation.
- The 3 existing scene-state tests remain unchanged and pass.
- Mobile TypeScript and narrow backend ESLint checks pass.

The [Apple WeatherKit allowance](https://developer.apple.com/weatherkit/) is shared across the existing membership. No additional subscription was purchased. Root owns credentials, deployment and release verification.
