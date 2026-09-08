import { afterAll, describe, expect, it } from 'vitest';
import i18n, {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '../../src/i18n/index.js';

const NAMESPACE_PROBES = {
  excursions: 'hero.title_prefix',
  safaris: 'hero.title_prefix',
  policy: 'policies.privacy.title',
};

describe('lazy locale namespace loader', () => {
  afterAll(async () => {
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
  });

  it('loads route namespaces for every supported language', async () => {
    for (const language of SUPPORTED_LANGUAGES) {
      await i18n.changeLanguage(language);

      for (const [namespace, key] of Object.entries(NAMESPACE_PROBES)) {
        await i18n.loadNamespaces(namespace);
        const value = i18n.t(key, { ns: namespace });

        expect(typeof value).toBe('string');
        expect(value.trim()).not.toBe('');
        expect(value).not.toBe(key);
      }
    }
  });
});
