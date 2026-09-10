import { afterAll, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Trans } from 'react-i18next';
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

  it('keeps Polish singular, few and many forms after lazy loading', async () => {
    await i18n.changeLanguage('pl');
    await i18n.loadNamespaces('store');
    expect(i18n.t('list.count', { ns: 'store', count: 1 })).toBe('1 atrakcja');
    expect(i18n.t('list.count', { ns: 'store', count: 2 })).toBe('2 atrakcje');
    expect(i18n.t('list.count', { ns: 'store', count: 5 })).toBe('5 atrakcji');
  });

  it.each(SUPPORTED_LANGUAGES)('preserves translated policy links in %s', async (language) => {
    await i18n.changeLanguage(language);
    await i18n.loadNamespaces('store');
    const html = renderToStaticMarkup(createElement(Trans, {
      i18n,
      ns: 'store',
      i18nKey: 'checkout.terms_ack',
      components: {
        booking: createElement('a', { href: '/booking-policy' }),
        terms: createElement('a', { href: '/terms-of-service' }),
      },
    }));
    expect(html).toMatch(/<a href="\/booking-policy">[^<]+<\/a>/);
    expect(html).toMatch(/<a href="\/terms-of-service">[^<]+<\/a>/);
    expect(html).not.toContain('checkout.terms_ack');
    expect(html).not.toContain('<booking>');
  });

  it('settles rapid language changes on the last choice', async () => {
    await Promise.all([i18n.changeLanguage('de'), i18n.changeLanguage('pl')]);
    expect(i18n.resolvedLanguage).toBe('pl');
    expect(i18n.t('list.count', { ns: 'store', count: 2 })).toBe('2 atrakcje');
  });
});
