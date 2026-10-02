import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExcursionDetail from '../../src/pages/ExcursionDetail.jsx';
import ExperiencesStore from '../../src/pages/ExperiencesStore.jsx';
import StoreBookingSection from '../../src/components/store/StoreBookingSection.jsx';

const route = vi.hoisted(() => ({ id: 'spice-tour', language: 'en', t: undefined, storeEnabled: false }));

vi.mock('react-i18next', () => ({
  useTranslation: (namespaces) => ({
    t: (key, options) => route.t(key.includes(':') ? key : `${Array.isArray(namespaces) ? namespaces[0] : namespaces}:${key}`, options),
    i18n: { resolvedLanguage: route.language }, ready: true,
  }),
}));
vi.mock('react-router', async () => {
  const { createElement } = await import('react');
  return {
    useParams: () => ({ id: route.id }),
    Link: ({ to, children, ...props }) => createElement('a', { href: to, ...props }, children),
  };
});
vi.mock('../../src/context/useCurrency.js', () => ({ useCurrency: () => ({ format: (value) => `$${value}` }) }));
vi.mock('../../src/config/featureFlags.js', () => ({ isStoreEnabled: () => route.storeEnabled }));
vi.mock('../../src/components/store/BookingPanel.jsx', async () => {
  const { createElement } = await import('react');
  return {
    STORE_GUESTS_KEY: 'dp_store_guests_v1',
    default: ({ experience }) => createElement('div', { 'data-booking-experience': experience.id }),
  };
});

afterEach(() => vi.unstubAllGlobals());

function resourcesFor(language) {
  return Object.fromEntries(['excursions', 'catalog', 'store'].map((namespace) => [
    namespace,
    JSON.parse(readFileSync(new URL(`../../src/locales/${language}/${namespace}.json`, import.meta.url), 'utf8')),
  ]));
}

function renderDetail(language, id, storeEnabled = false) {
  const resources = resourcesFor(language);
  route.language = language;
  route.id = id;
  route.storeEnabled = storeEnabled;
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
        expect(html).toContain(`href="/book-now?type=excursion&item=${id}#booking-contact"`);
        expect(html).toContain(`href="/booking?type=excursion&item=${id}#booking-contact"`);
        expect(html).not.toContain('href="#book"');
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
      expect(html).toContain('href="/book-now?type=excursion&item=prison-island#booking-contact"');
      expect(html).toContain('href="/booking?type=excursion&item=prison-island#booking-contact"');
    });

    it(`${language} sends enabled pilot booking to its online panel and preserves the separate footer enquiry`, () => {
      for (const id of ['spice-tour', 'stone-town', 'safari-blue']) {
        const { html } = renderDetail(language, id, true);
        expect(html).toContain('href="#book"');
        expect(html).toContain('id="book"');
        expect(html).toContain(`data-booking-experience="${id}"`);
        expect(html).toContain(`href="/booking?type=excursion&item=${id}#booking-contact"`);
        expect(html).not.toContain(`href="/book-now?type=excursion&item=${id}#booking-contact"`);
      }
      const { html } = renderDetail(language, 'prison-island', true);
      expect(html).toContain('href="/book-now?type=excursion&item=prison-island#booking-contact"');
      expect(html).not.toContain('id="book"');
      expect(html).not.toContain('data-booking-experience');
      expect(renderToStaticMarkup(createElement(StoreBookingSection, { excursionId: 'prison-island' }))).toBe('');
    });

    it(`${language} limits the Store grid to pilots and retains its search, filters and hero`, () => {
      const { resources } = renderDetail(language, 'spice-tour');
      const html = renderToStaticMarkup(createElement(ExperiencesStore));
      for (const id of ['spice-tour', 'stone-town', 'safari-blue']) expect(html).toContain(`/excursions/${id}#book`);
      expect(html).not.toContain('/excursions/prison-island#book');
      expect(html).not.toContain('exp-card__type--request');
      expect(html).not.toContain('store-chips__dot--request');
      expect(html).toContain(resources.store.list.filter_all);
      expect(html).toContain(resources.store.list.filter_instant);
      expect(html).toContain('type="search"');
      expect(html).toContain('store-hero__bg');
      expect(html).toContain('dp-drift');
    });
  }

  it('caps new guest selection at six while preserving a larger existing session preference until explicitly changed', () => {
    const { resources } = renderDetail('en', 'spice-tour');
    const write = vi.fn();
    for (const guests of [6, 12]) {
      vi.stubGlobal('window', { sessionStorage: { getItem: () => String(guests), setItem: write } });
      const html = renderToStaticMarkup(createElement(ExperiencesStore));
      expect(html).toContain(`<span class="guest-picker__value" aria-live="polite">${guests}</span>`);
      expect(html).toContain(`aria-label="${resources.store.guests.increase}" disabled=""`);
      expect(write).not.toHaveBeenCalled();
    }
  });
});
