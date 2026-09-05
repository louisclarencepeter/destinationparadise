# decode-uri-component 0.5.0 — CommonJS compatibility

This is the MIT-licensed upstream `decode-uri-component@0.5.0` decoder, vendored
for Expo Router 57's `query-string@7.1.3` dependency. Its older decoder is affected
by [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr): malformed
percent-encoded input can consume excessive CPU while parsing an incoming link.

Upstream 0.5.0 fixes the decoder but exports only ESM. `query-string@7.1.3` expects
`require('decode-uri-component')` to be callable. A direct override to the ESM
release breaks that contract. This package makes exactly these compatibility changes:

- Rename upstream `index.js` to `index.cjs` and replace its single
  `export default function decodeUriComponent(` with
  `module.exports = function decodeUriComponent(`. The decoder algorithm is unchanged.
- Adapt the declaration to `export = decodeUriComponent` and set the CommonJS
  package entry. Preserve the upstream MIT license in `LICENSE`.

Source: [upstream v0.5.0](https://github.com/SamVerschueren/decode-uri-component/releases/tag/v0.5.0),
downloaded from `https://registry.npmjs.org/decode-uri-component/-/decode-uri-component-0.5.0.tgz`
on 2026-09-05. Tarball integrity:

```
sha512-1BiQVoK8C9gUbQU6NzAtO/tkz2qOFpEObMWpcFvhx4fYnj4Oc5yzaJN/LD36ihkVUdXyh5ZekzX+yM+ty/SrPg==
```

SHA-256 of original `index.js`:
`9401353df38f8010ad7035fe8d666bce6a4902bc1cff809afc4ab23fa2e0bdaa`.
SHA-256 of transformed `index.cjs`:
`684ba79779327ba789733a3a563050370a928a57eb7dd33d19b346f43b32cbb7`.

The application's direct `file:vendor/decode-uri-component` dependency and
`$decode-uri-component` npm override route all transitive consumers here.
The source and lockfile must be included in EAS archives; no postinstall script,
remote Git dependency, or build-time code download is needed.

`test/router-decoder.test.ts` exercises the installed query parser and Expo Router
directly, verifies valid/malformed text handling, and runs the formerly expensive
input in a separate process with a time limit. Remove this local package and its
override once Expo Router adopts a compatible fixed upstream decoder.
