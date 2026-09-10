// Keeps non-production deploys out of search engines.
//
// Netlify branch deploys (unlike deploy previews) get no automatic
// X-Robots-Tag, so the store/development staging URLs would be indexable —
// especially since launched-mode builds intentionally drop the on-page
// noindex. This post-build step appends a site-wide noindex header to
// dist/_headers whenever the build context is not production. Netlify merges
// headers from every matching rule, so appending is safe alongside the
// security headers copied from public/_headers.
import { appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const context = process.env.CONTEXT || '';
const headersFile = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/_headers');

if (!context || context === 'production') {
  console.log(`[staging-headers] context "${context || 'local'}" — leaving robots headers untouched`);
} else if (!existsSync(headersFile)) {
  console.warn('[staging-headers] dist/_headers missing — skipped');
} else {
  appendFileSync(
    headersFile,
    `\n# Non-production deploy (${context}): never index staging.\n/*\n  X-Robots-Tag: noindex\n`,
  );
  console.log(`[staging-headers] appended X-Robots-Tag: noindex for context "${context}"`);
}
