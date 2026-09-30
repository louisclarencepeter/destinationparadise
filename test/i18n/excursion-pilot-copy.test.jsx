import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import ExcursionDetail from '../../src/pages/ExcursionDetail.jsx';

const route = vi.hoisted(() => ({ id: 'spice-tour', language: 'en', t: undefined }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: route.t, i18n: { resolvedLanguage: route.language }, ready: true }),
}));
vi.mock('react-router', async () => {
  const { createElement } = await import('react');
  return {
    useParams: () => ({ id: route.id }),
    Link: ({ to, children, ...props }) => createElement('a', { href: to, ...props }, children),
  };
});
vi.mock('../../src/context/useCurrency.js', () => ({ useCurrency: () => ({ format: (value) => `$${value}` }) }));
vi.mock('../../src/config/featureFlags.js', () => ({ isStoreEnabled: () => false }));

function resourcesFor(language) {
  return Object.fromEntries(['excursions', 'catalog'].map((namespace) => [
    namespace,
    JSON.parse(readFileSync(new URL(`../../src/locales/${language}/${namespace}.json`, import.meta.url), 'utf8')),
  ]));
}

function renderDetail(language, id) {
  const resources = resourcesFor(language);
  route.language = language;
  route.id = id;
  route.t = (key, options = {}) => {
    const [namespace, path] = key.includes(':') ? key.split(':', 2) : ['excursions', key];
    const value = path.split('.').reduce((current, part) => current?.[part], resources[namespace]);
    if (typeof value !== 'string') return value ?? options.defaultValue ?? key;
    return value.replace(/\{\{([^}]+)\}\}/g, (_, name) => String(options[name] ?? `{{${name}}}`));
  };
  const html = renderToStaticMarkup(createElement(ExcursionDetail)).replace(/&amp;/g, '&');
  return { html, resources };
}

describe('pilot excursion detail copy', () => {
  for (const language of ['en', 'de', 'pl']) {
    it(`${language} renders the online group limit, quoted pickup and indicative price without translation keys`, () => {
      for (const id of ['spice-tour', 'stone-town', 'safari-blue']) {
        const { html, resources } = renderDetail(language, id);
        const copy = resources.excursions;
        expect(html).toContain(resources.catalog.excursions[id].group);
        expect(html).toContain(copy.detail.pilot_price_note);
        expect(html).toContain(copy.detail.practical.included.pilot_pickup);
        expect(html).toContain(`${copy.detail.from} $`);
        expect(html.match(new RegExp(`href="/booking\\?type=excursion&item=${id}#booking-contact"`, 'g'))).toHaveLength(2);
        expect(html).not.toMatch(/detail\.(pilot_price_note|practical\.included\.pilot_)/);
      }
    });

    it(`${language} keeps the nonpilot inclusion and price presentation`, () => {
      const { html, resources } = renderDetail(language, 'prison-island');
      const copy = resources.excursions;
      expect(html).toContain(copy.detail.practical.included.items[0]);
      expect(html).not.toContain(copy.detail.practical.included.pilot_pickup);
      expect(html).not.toContain(copy.detail.pilot_price_note);
      expect(html).not.toContain(`${copy.detail.from} $`);
      expect(html.match(/href="\/booking\?type=excursion&item=prison-island#booking-contact"/g)).toHaveLength(2);
    });
  }
});
