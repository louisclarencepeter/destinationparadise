import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EXCURSIONS } from '../../src/data/excursionsData.js';
import { EXCURSION_COMBINATIONS } from '../../src/data/excursionCombinations.js';
import { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } from '../../src/data/safariPageData.js';
import {
  buildLocalizedExcursionCombinations,
  buildLocalizedExcursions,
  buildLocalizedSafariProducts,
  buildLocalizedSafariTypes,
} from '../../src/data/localizedCatalog.js';
import { buildSiteSearchIndex, buildSiteSearchPopular } from '../../src/data/siteSearchIndex.js';
import { getInstantExperience, getRequestExperience } from '../../src/data/commerceCatalog.js';
import { SAFARI_FILTERS } from '../../src/data/safarisPageContent.js';

const LOCALE_ROOT = new URL('../../src/locales/', import.meta.url);
const NAMESPACES = ['catalog', 'common', 'excursions', 'packages', 'safaris', 'store', 'transfers'];

function resourcesFor(language) {
  return Object.fromEntries(NAMESPACES.map((namespace) => [
    namespace,
    JSON.parse(readFileSync(join(LOCALE_ROOT.pathname, language, `${namespace}.json`), 'utf8')),
  ]));
}

function translatorFor(language) {
  const resources = resourcesFor(language);
  return (key, options = {}) => {
    const [namespace, rawPath] = key.includes(':') ? key.split(':', 2) : ['common', key];
    const value = rawPath.split('.').reduce((current, part) => current?.[part], resources[namespace]);
    return value ?? options.defaultValue ?? key;
  };
}

function stringsAtPaths(value, path = [], output = []) {
  if (typeof value === 'string') output.push([path.join('.'), value]);
  else if (Array.isArray(value)) value.forEach((item, index) => stringsAtPaths(item, [...path, index], output));
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => stringsAtPaths(item, [...path, key], output));
  }
  return output;
}

describe('localized editorial catalog', () => {
  for (const language of ['en', 'de', 'pl']) {
    it(`${language} covers every catalog record without changing stable ids`, () => {
      const t = translatorFor(language);
      const excursions = buildLocalizedExcursions(t);
      const combinations = buildLocalizedExcursionCombinations(t);
      const safaris = buildLocalizedSafariProducts(t);
      const safariTypes = buildLocalizedSafariTypes(t);

      expect(excursions.map(({ id }) => id)).toEqual(EXCURSIONS.map(({ id }) => id));
      expect(combinations.map(({ id }) => id)).toEqual(EXCURSION_COMBINATIONS.map(({ id }) => id));
      expect(safaris.map(({ id }) => id)).toEqual(ALL_SAFARI_PRODUCTS.map(({ id }) => id));
      expect(safariTypes.map(({ id }) => id)).toEqual(SAFARI_TYPES.map(({ id }) => id));
      expect(excursions.map(({ category }) => category)).toEqual(EXCURSIONS.map(({ category }) => category));
      expect(safaris.map(({ category }) => category)).toEqual(ALL_SAFARI_PRODUCTS.map(({ category }) => category));
      expect(excursions.map(({ price }) => price)).toEqual(EXCURSIONS.map(({ price }) => price));
      expect(safaris.map(({ price, publicPrice }) => ({ price, publicPrice }))).toEqual(
        ALL_SAFARI_PRODUCTS.map(({ price, publicPrice }) => ({ price, publicPrice })),
      );
      for (const filter of SAFARI_FILTERS) {
        expect(safaris.filter(filter.match).map(({ id }) => id), filter.key).toEqual(
          ALL_SAFARI_PRODUCTS.filter(filter.match).map(({ id }) => id),
        );
      }
    });
  }

  it('fixes every English line visible in the reported German Rock card', () => {
    const rock = buildLocalizedExcursions(translatorFor('de')).find(({ id }) => id === 'sunset-rock');
    expect(rock.title).toBe('Sonnenuntergang & The Rock Restaurant');
    expect(rock.cols[0].h).toBe('Auf der Reise');
    expect(rock.cols[0].items).toEqual([
      'Sonnenuntergang am Michamvi Beach',
      'Optionaler Spaziergang zum The Rock Restaurant',
      'Musik und Sundowner direkt am Strand',
      'Ruhige Fahrt zurück entlang der Küste',
    ]);
    expect(rock.cols[1].items).toContain('Die Reservierung im The Rock Restaurant erfolgt separat');
  });

  it('builds German and Polish search indexes from localized products and page copy', () => {
    const deT = translatorFor('de');
    const plT = translatorFor('pl');
    const deIndex = buildSiteSearchIndex(deT);
    const plIndex = buildSiteSearchIndex(plT);

    expect(deIndex.find(({ to }) => to === '/excursions')?.title).toBe('Ausflüge');
    expect(deIndex.find(({ to }) => to === '/excursions/sunset-rock')?.title).toBe('Sonnenuntergang & The Rock Restaurant');
    expect(plIndex.find(({ to }) => to === '/excursions')?.title).toBe('Wycieczki');
    expect(plIndex.find(({ to }) => to === '/safaris/birdwatching-safari')?.title).toBe('Safari ornitologiczne');
    expect(buildSiteSearchPopular(deT)[0]).toBe('Flughafentransfer');
    expect(buildSiteSearchPopular(plT)[0]).toBe('Transfer z lotniska');
  });

  it('preserves every numeric field inside translated safari upgrades', () => {
    for (const language of ['en', 'de', 'pl']) {
      const safaris = buildLocalizedSafariProducts(translatorFor(language));
      const expected = ALL_SAFARI_PRODUCTS.map(({ id, upsells = [] }) => ({
        id, prices: upsells.map(({ price }) => price),
      }));
      expect(safaris.map(({ id, upsells = [] }) => ({
        id, prices: upsells.map(({ price }) => price),
      }))).toEqual(expected);
      const ngorongoro = safaris.find(({ id }) => id === 'ngorongoro-tarangire');
      expect(ngorongoro.upsells.map(({ price }) => price)).toEqual([450, 600, 550]);
      expect(ngorongoro.upsells.map(({ name }) => name)).toEqual(
        resourcesFor(language).catalog.safariProducts['ngorongoro-tarangire'].upsells.map(({ name }) => name),
      );
    }
  });

  it('keeps source identity, media and commercial fields when a locale includes accidental overrides', () => {
    const baseT = translatorFor('de');
    const translatedProducts = structuredClone(baseT('catalog:safariProducts'));
    Object.assign(translatedProducts['ngorongoro-tarangire'], {
      id: 'wrong-route',
      image: '/wrong-photo.webp',
      originalImage: '/wrong-original.webp',
      imageNeeded: true,
      price: 1,
      publicPrice: { lowSeason: 1, peakSeason: 2, currency: 'EUR' },
      upsells: [{ name: 'Übersetztes Upgrade', price: 0 }],
    });
    const t = (key, options) => key === 'catalog:safariProducts' ? translatedProducts : baseT(key, options);
    const source = ALL_SAFARI_PRODUCTS.find(({ id }) => id === 'ngorongoro-tarangire');
    const localized = buildLocalizedSafariProducts(t).find(({ id }) => id === source.id);
    expect(localized).toBeDefined();
    expect(localized.image).toBe(source.image);
    expect(localized.originalImage).toBe(source.originalImage);
    expect(localized.imageNeeded).toBe(source.imageNeeded);
    expect(localized.price).toBe(source.price);
    expect(localized.publicPrice).toEqual(source.publicPrice);
    expect(localized.upsells).toEqual([
      { ...source.upsells[0], name: 'Übersetztes Upgrade' },
      ...source.upsells.slice(1),
    ]);
  });

  it('localizes generated image text without replacing existing photography', () => {
    for (const language of ['de', 'pl']) {
      const t = translatorFor(language);
      const sourceById = new Map(ALL_SAFARI_PRODUCTS.map((item) => [item.id, item]));
      const safaris = buildLocalizedSafariProducts(t);
      const placeholder = safaris.find(({ id }) => id === 'ngorongoro-overnight');
      const svgText = (url) => decodeURIComponent(url.split(',').slice(1).join(','))
        .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

      expect(placeholder.imageNeeded).toBe(true);
      expect(svgText(placeholder.image)).toContain(placeholder.title);
      expect(svgText(placeholder.image)).toContain(placeholder.localizedCategory);
      expect(svgText(placeholder.image)).toContain(t('catalog:placeholders.photo').toUpperCase());
      expect(svgText(placeholder.image)).not.toContain('PHOTO COMING SOON');
      for (const safari of safaris) {
        const source = sourceById.get(safari.id);
        if (source.imageNeeded) {
          expect(safari.originalImage).toBe(source.originalImage);
          expect(safari.imageTBD).toBe(true);
        } else {
          expect(safari.image).toBe(source.image);
        }
      }

      const placeholders = buildLocalizedExcursions(t).filter((item) => item.imageNeeded);
      for (const excursion of placeholders) {
        expect(svgText(excursion.image)).toContain(t('catalog:placeholders.excursion').toUpperCase());
        expect(svgText(excursion.image)).toContain(t('catalog:placeholders.photo').toUpperCase());
        expect(svgText(excursion.image)).toContain(excursion.localizedCategory.replace(/&/g, '&amp;'));
      }
    }
  });

  it('keeps booking prices and eligibility stable when resolving translated cart items', () => {
    for (const language of ['de', 'pl']) {
      const t = translatorFor(language);
      const excursions = buildLocalizedExcursions(t);
      const operationalCopy = resourcesFor(language).store.catalog;
      const instant = getInstantExperience('spice-tour', excursions, operationalCopy);
      expect(instant).toMatchObject({
        ...getInstantExperience('spice-tour'),
        title: excursions.find(({ id }) => id === 'spice-tour').title,
        alt: excursions.find(({ id }) => id === 'spice-tour').alt,
        blurb: excursions.find(({ id }) => id === 'spice-tour').description,
        durationTag: excursions.find(({ id }) => id === 'spice-tour').duration,
        pickup: operationalCopy.pickups['spice-tour'],
      });
      expect(getInstantExperience('prison-island', excursions, operationalCopy)).toBeNull();
      expect(getRequestExperience('prison-island', excursions, operationalCopy)).toMatchObject({
        bookingMode: 'request',
        title: excursions.find(({ id }) => id === 'prison-island').title,
      });
    }
  });

  it('does not silently retain full English editorial phrases in German or Polish', () => {
    const english = new Map(stringsAtPaths(resourcesFor('en').catalog));
    const allowedLocaleNeutralValues = new Set([
      'Sept – Mar',
      'Jun – Sep · Dec – Feb',
      'Ngorongoro & Tarangire',
    ]);

    for (const language of ['de', 'pl']) {
      const unchanged = stringsAtPaths(resourcesFor(language).catalog)
        .filter(([path, value]) => (
          english.get(path) === value &&
          value.trim().split(/\s+/).length >= 3 &&
          !allowedLocaleNeutralValues.has(value) &&
          !path.endsWith('.from') &&
          !/[↔→]/.test(value) &&
          !['Sauti za Busara Festival', 'Zanzibar International Film Festival', 'Safari + Zanzibar', 'Zanzibar pizza, mishkaki, urojo'].includes(value)
        ));
      expect(unchanged, `${language} contains English catalog fallbacks`).toEqual([]);
    }
  });
});
