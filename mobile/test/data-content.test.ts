import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { destinations, foodAreas, guideEvents, monthlySeasons, contentProvenance } from '../src/data/content';

test('mobile content is a deterministic snapshot of current website sources', () => {
  const script = fileURLToPath(new URL('../scripts/sync-content.mjs', import.meta.url));
  assert.match(execFileSync(process.execPath, [script, '--check'], { encoding: 'utf8' }), /matches website sources/);
});

test('all website destination numbers, regions, related experiences and photographs survive adaptation', async () => {
  assert.equal(destinations.length, 24);
  assert.deepEqual(destinations.map(({ number }) => number), Array.from({ length: 24 }, (_, index) => index + 1));
  assert.equal(new Set(destinations.map(({ id }) => id)).size, 24);
  assert.equal(destinations.filter(({ region }) => region === 'Zanzibar').length, 7);
  assert.equal(destinations.filter(({ region }) => region === 'Mainland').length, 17);
  for (const destination of destinations) {
    assert.ok(destination.lat < 0 && destination.lat > -12);
    assert.ok(destination.lng > 29 && destination.lng < 41);
    assert.ok(destination.text && destination.bestFor.length);
    assert.equal(destination.imageIsRepresentative, destination.region === 'Mainland');
    assert.ok(destination.imageLabel);
    if (destination.imageIsRepresentative) assert.match(destination.imageLabel, /representative photo/);
    assert.ok(destination.excursions.length + destination.safaris.length + destination.packages.length > 0);
    const url = new URL(destination.image);
    assert.equal(url.origin, 'https://yournexttriptoparadise.com');
    await access(fileURLToPath(new URL(`../../public${url.pathname}`, import.meta.url)));
  }
});

test('coastal activity photographs name their actual source locality rather than the departure hub', () => {
  assert.match(destinations.find(({ id }) => id === 'fumba')!.imageLabel, /Menai Bay/);
  assert.match(destinations.find(({ id }) => id === 'matemwe')!.imageLabel, /Mnemba/);
});

test('food and events retain source review status and working map-link query semantics', () => {
  assert.equal(foodAreas.length, 8);
  assert.equal(foodAreas.flatMap(({ places }) => places).length, 32);
  assert.equal(guideEvents.length, 6);
  assert.match(contentProvenance.guideReviewed, /July 2026/);
  for (const area of foodAreas) {
    for (const place of area.places) {
      const link = new URL(place.mapUrl);
      assert.equal(link.searchParams.get('query'), `${place.name} ${area.mapLabel} Zanzibar`);
      assert.equal(link.searchParams.get('api'), '1');
    }
  }
});

test('all 12 seasonal temperatures remain editorial values instead of live weather', () => {
  assert.deepEqual(monthlySeasons.map(({ temperature }) => temperature), [32, 33, 32, 30, 29, 28, 27, 27, 28, 29, 30, 31]);
  assert.deepEqual(monthlySeasons.map(({ monthIndex }) => monthIndex), Array.from({ length: 12 }, (_, index) => index));
  assert.match(contentProvenance.seasonalValues, /not a weather forecast/);
});
