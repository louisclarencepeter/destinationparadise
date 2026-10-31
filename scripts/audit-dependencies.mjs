// CI dependency audit: fails on any moderate or worse npm advisory, except the
// reviewed ones below, which have no fix within the versions our dependencies
// accept. Each allowance holds only up to the severity it was reviewed at, and
// the script warns once an allowance stops matching so it can be removed.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEVERITY = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

export const ALLOWED_ADVISORIES = {
  // Reviewed 31 October 2026. Remove when eslint, workbox-build and
  // @sentry/bundler-plugins accept minimatch 11.0.1+ and glob 14.0.2+.
  'GHSA-g3hv-75wg-m249': {
    severity: 'moderate',
    reason: 'minimatch <11.0.1 pattern DoS. Only eslint, workbox-build and @sentry/bundler-plugins use it, '
      + 'to match their own build-time globs; the fix is only in minimatch 11, which they do not accept yet.',
  },
  'GHSA-3g3m-2fjr-6pw4': {
    severity: 'moderate',
    reason: 'glob <=14.0.1 AbortSignal bypass. Only workbox-build and @sentry/bundler-plugins use it, at build '
      + 'time and without abort signals from user input; the fix is only in glob 14.0.2+.',
  },
};

const rank = (severity) => SEVERITY[severity] ?? SEVERITY.critical;
const advisoryId = (url = '') => url.split('/').pop();

// Splits an `npm audit --json` report into advisories that should fail CI,
// reviewed allowances that still apply, and allowances nothing matches now.
export function auditFindings(report, { allowed = ALLOWED_ADVISORIES, minSeverity = 'moderate' } = {}) {
  if (report?.error) throw new Error(`npm audit failed: ${report.error.summary || report.error.code || 'unknown error'}`);
  if (!report?.vulnerabilities) throw new Error('npm audit returned no vulnerability report');

  const advisories = new Map();
  for (const entry of Object.values(report.vulnerabilities)) {
    for (const via of entry.via ?? []) {
      if (typeof via !== 'object') continue; // "depends on <package>", reported on that package
      const id = advisoryId(via.url) || `${via.name}:${via.title}`;
      const advisory = advisories.get(id) ?? { id, title: via.title, severity: via.severity, url: via.url, packages: [] };
      if (!advisory.packages.includes(via.name)) advisory.packages.push(via.name);
      advisories.set(id, advisory);
    }
  }

  const blocking = [];
  const allowedFindings = [];
  for (const advisory of advisories.values()) {
    if (rank(advisory.severity) < rank(minSeverity)) continue;
    const allowance = allowed[advisory.id];
    if (allowance && rank(advisory.severity) <= rank(allowance.severity)) allowedFindings.push(advisory);
    else blocking.push(advisory);
  }
  const unusedAllowances = Object.keys(allowed).filter((id) => !advisories.has(id));
  return { blocking, allowed: allowedFindings, unusedAllowances };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // npm audit exits non-zero whenever it finds anything; the JSON decides.
  const result = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    console.error(result.stderr || result.stdout);
    throw new Error('npm audit did not return JSON');
  }

  const { blocking, allowed, unusedAllowances } = auditFindings(report);
  for (const advisory of allowed) {
    console.log(`Allowed ${advisory.id} (${advisory.severity}, ${advisory.packages.join(', ')}): ${ALLOWED_ADVISORIES[advisory.id].reason}`);
  }
  for (const id of unusedAllowances) {
    console.log(`::warning::${id} is no longer reported by npm audit; remove its allowance from scripts/audit-dependencies.mjs.`);
  }
  if (blocking.length > 0) {
    for (const advisory of blocking) {
      console.error(`${advisory.severity} ${advisory.id} in ${advisory.packages.join(', ')}: ${advisory.title} ${advisory.url}`);
    }
    console.error('Run `npm audit` for the dependency paths.');
    process.exitCode = 1;
  } else {
    console.log('No moderate or higher advisories outside the reviewed allowances.');
  }
}
