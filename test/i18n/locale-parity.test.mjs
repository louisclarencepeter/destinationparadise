import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCALE_ROOT = new URL('../../src/locales/', import.meta.url);
const BASE_LANG = 'en';
const OTHER_LANGS = ['de', 'pl'];

function readNamespace(lang, file) {
  return JSON.parse(readFileSync(join(LOCALE_ROOT.pathname, lang, file), 'utf8'));
}

function collectShapeMismatches(baseValue, otherValue, path = []) {
  if (Array.isArray(baseValue)) {
    if (!Array.isArray(otherValue)) return [`${path.join('.')} expected array`];
    if (baseValue.length !== otherValue.length) {
      return [`${path.join('.')} expected ${baseValue.length} items, got ${otherValue.length}`];
    }
    return [];
  }

  if (!baseValue || typeof baseValue !== 'object') return [];
  if (!otherValue || typeof otherValue !== 'object' || Array.isArray(otherValue)) {
    return [`${path.join('.')} expected object`];
  }

  const baseKeys = Object.keys(baseValue);
  const otherKeys = Object.keys(otherValue);
  const missing = baseKeys
    .filter((key) => !otherKeys.includes(key))
    .map((key) => `${[...path, key].join('.')} missing`);
  const extra = otherKeys
    .filter((key) => !baseKeys.includes(key))
    .map((key) => `${[...path, key].join('.')} extra`);
  const nested = baseKeys.flatMap((key) =>
    collectShapeMismatches(baseValue[key], otherValue[key], [...path, key]));

  return [...missing, ...extra, ...nested];
}

describe('locale namespace parity', () => {
  const files = readdirSync(join(LOCALE_ROOT.pathname, BASE_LANG)).filter((file) => file.endsWith('.json'));

  for (const file of files) {
    it(`${file} keeps matching keys and array lengths`, () => {
      const base = readNamespace(BASE_LANG, file);
      const mismatches = OTHER_LANGS.flatMap((lang) =>
        collectShapeMismatches(base, readNamespace(lang, file)).map((message) => `${lang}: ${message}`));

      expect(mismatches).toEqual([]);
    });
  }
});
