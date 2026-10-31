import { describe, expect, it } from 'vitest';
import { auditFindings } from '../../scripts/audit-dependencies.mjs';

const advisory = (name, id, severity, title = `${name} issue`) => ({
  source: 1, name, dependency: name, title, url: `https://github.com/advisories/${id}`, severity, range: '<9.9.9',
});

// The shape `npm audit --json` (report version 2) gives each vulnerable package.
function report(entries) {
  return {
    auditReportVersion: 2,
    vulnerabilities: Object.fromEntries(entries.map(([name, via]) => [name, { name, via }])),
  };
}

const ALLOWED = {
  'GHSA-aaaa-aaaa-aaaa': { severity: 'moderate', reason: 'reviewed' },
};

describe('dependency audit allowances', () => {
  it('passes a reviewed advisory and the packages that only depend on it', () => {
    const findings = auditFindings(report([
      ['minimatch', [advisory('minimatch', 'GHSA-aaaa-aaaa-aaaa', 'moderate')]],
      ['eslint', ['minimatch']],
    ]), { allowed: ALLOWED });

    expect(findings.blocking).toEqual([]);
    expect(findings.allowed.map((item) => item.id)).toEqual(['GHSA-aaaa-aaaa-aaaa']);
    expect(findings.unusedAllowances).toEqual([]);
  });

  it('fails on any other moderate or worse advisory', () => {
    const findings = auditFindings(report([
      ['minimatch', [advisory('minimatch', 'GHSA-aaaa-aaaa-aaaa', 'moderate')]],
      ['left-pad', [advisory('left-pad', 'GHSA-bbbb-bbbb-bbbb', 'moderate')]],
      ['right-pad', [advisory('right-pad', 'GHSA-cccc-cccc-cccc', 'critical')]],
    ]), { allowed: ALLOWED });

    expect(findings.blocking.map((item) => item.id)).toEqual(['GHSA-bbbb-bbbb-bbbb', 'GHSA-cccc-cccc-cccc']);
  });

  it('ignores advisories below moderate', () => {
    const findings = auditFindings(report([
      ['deepmerge', [advisory('deepmerge', 'GHSA-dddd-dddd-dddd', 'low')]],
    ]), { allowed: ALLOWED });

    expect(findings.blocking).toEqual([]);
    expect(findings.allowed).toEqual([]);
  });

  it('fails again when a reviewed advisory is raised above its reviewed severity', () => {
    const findings = auditFindings(report([
      ['minimatch', [advisory('minimatch', 'GHSA-aaaa-aaaa-aaaa', 'high')]],
    ]), { allowed: ALLOWED });

    expect(findings.blocking.map((item) => item.id)).toEqual(['GHSA-aaaa-aaaa-aaaa']);
  });

  it('treats an unknown severity as critical', () => {
    const findings = auditFindings(report([
      ['minimatch', [advisory('minimatch', 'GHSA-aaaa-aaaa-aaaa', 'severe')]],
    ]), { allowed: ALLOWED });

    expect(findings.blocking.map((item) => item.id)).toEqual(['GHSA-aaaa-aaaa-aaaa']);
  });

  it('lists every package one advisory affects', () => {
    const findings = auditFindings(report([
      ['glob', [advisory('glob', 'GHSA-bbbb-bbbb-bbbb', 'moderate')]],
      ['@sentry/bundler-plugins/node_modules/glob', [advisory('glob', 'GHSA-bbbb-bbbb-bbbb', 'moderate')]],
      ['minimatch', [advisory('minimatch', 'GHSA-bbbb-bbbb-bbbb', 'moderate')]],
    ]), { allowed: {} });

    expect(findings.blocking).toHaveLength(1);
    expect(findings.blocking[0].packages).toEqual(['glob', 'minimatch']);
  });

  it('reports allowances npm audit no longer matches', () => {
    expect(auditFindings(report([]), { allowed: ALLOWED }).unusedAllowances).toEqual(['GHSA-aaaa-aaaa-aaaa']);
  });

  it('fails loudly when npm audit itself fails', () => {
    expect(() => auditFindings({ error: { code: 'ENOAUDIT', summary: 'registry unreachable' } }))
      .toThrow('npm audit failed: registry unreachable');
    expect(() => auditFindings({})).toThrow('no vulnerability report');
  });
});
