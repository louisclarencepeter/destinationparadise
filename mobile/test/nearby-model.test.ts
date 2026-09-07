import test from 'node:test';
import assert from 'node:assert/strict';
import { destinations, type Destination } from '../src/data/content';
import {
  MAX_NEARBY_RADIUS_KM,
  distanceKmBetween,
  isValidCoordinates,
  recommendNearby,
  type Coordinates,
} from '../src/features/nearby/nearby-model';

const point = (id: string): Coordinates => {
  const destination = destinations.find((item) => item.id === id)!;
  return { latitude: destination.lat, longitude: destination.lng };
};

test('Stone Town suggests its real tours and distances refer to their linked destination', () => {
  const result = recommendNearby(destinations, point('stone-town'));
  assert.equal(result.status, 'ready');
  assert.equal(result.destinations[0].destination.id, 'stone-town');
  assert.equal(result.destinations[0].distanceKm, 0);
  assert.equal(result.experiences[0].to, '/excursions/stone-town');
  assert.equal(result.experiences[0].label, 'Historical City Tour');
  assert.equal(result.experiences[0].destination.id, 'stone-town');
  assert.equal(result.experiences[0].distanceKm, 0);
  assert.match(result.distanceNotice, /straight-line.*destinations.*not tour starting points/);
  assert.match(result.transferNotice, /Zanzibar–mainland.*boat or flight/);
  for (const experience of result.experiences) {
    const source = experience.destination;
    assert.ok([...source.excursions, ...source.safaris, ...source.packages]
      .some((link) => link.to === experience.to && link.label === experience.label));
    assert.equal('availability' in experience, false);
    assert.equal('pickup' in experience, false);
    assert.equal('latitude' in experience, false);
  }
});

test('Nungwi ranks its north-coast links and deduplicates shared Mnemba trips', () => {
  const result = recommendNearby(destinations, point('nungwi'), { destinationLimit: 24, experienceLimit: 40 });
  assert.equal(result.destinations[0].destination.id, 'nungwi');
  const mnemba = result.experiences.filter((item) => item.id === '/excursions/mnemba');
  assert.equal(mnemba.length, 1);
  assert.equal(mnemba[0].destination.id, 'nungwi');
  assert.equal(mnemba[0].distanceKm, 0);
  const fromMatemwe = recommendNearby(destinations, point('matemwe'));
  assert.equal(fromMatemwe.experiences.find((item) => item.id === '/excursions/mnemba')?.destination.id, 'matemwe');
  assert.equal(new Set(result.experiences.map((item) => item.id)).size, result.experiences.length);
});

test('a Jambiani location uses the actual Paje pin rather than inventing a Jambiani tour pin', () => {
  const jambiani = { latitude: -6.3209, longitude: 39.5469 };
  const result = recommendNearby(destinations, jambiani);
  assert.equal(result.status, 'ready');
  assert.equal(result.destinations[0].destination.id, 'paje');
  assert.ok(result.destinations[0].distanceKm > 5 && result.destinations[0].distanceKm < 7);
  assert.equal(result.experiences[0].to, '/excursions/kitesurfing');
  assert.equal(result.experiences[0].destination.name, 'Paje');
  const marine = result.experiences.filter((item) => item.id === '/packages/zanzibar-adventure-marine-package');
  assert.equal(marine.length, 1);
  assert.equal(marine[0].kind, 'package');
  assert.equal(marine[0].destination.id, 'paje');
});

test('mainland locations use nearby safari hubs and do not inherit the Zanzibar UI region', () => {
  const result = recommendNearby(destinations, point('arusha'));
  assert.equal(result.status, 'ready');
  assert.equal(result.destinations[0].destination.id, 'arusha');
  assert.ok(result.destinations.every((item) => item.destination.region === 'Mainland'));
  assert.equal(result.experiences[0].to, '/safaris/ngorongoro-tarangire');
  assert.equal(result.experiences[0].kind, 'safari');
  assert.equal(recommendNearby(destinations, point('arusha'), { region: 'Zanzibar' }).status, 'no-matches');
});

test('a distant user receives a coverage fallback without misleading nearby tours', () => {
  const result = recommendNearby(destinations, { latitude: 47.3769, longitude: 8.5417 });
  assert.equal(result.status, 'outside-coverage');
  assert.ok(result.nearestDestination && result.nearestDestination.distanceKm > 1000);
  assert.deepEqual(result.destinations, []);
  assert.deepEqual(result.experiences, []);
  assert.equal(result.radiusKm, MAX_NEARBY_RADIUS_KM);
  assert.equal(recommendNearby(destinations, { latitude: 47.3769, longitude: 8.5417 }, { maxDistanceKm: 10000 }).status, 'outside-coverage');
});

test('invalid coordinates and unusable catalog pins fail closed without NaN distances', () => {
  for (const origin of [null, undefined, { latitude: NaN, longitude: 39 }, { latitude: 0, longitude: Infinity }, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: -181 }]) {
    const result = recommendNearby(destinations, origin);
    assert.equal(result.status, 'invalid-location');
    assert.equal(result.nearestDestination, null);
    assert.deepEqual(result.experiences, []);
  }
  assert.equal(isValidCoordinates({ latitude: '-6', longitude: 39 }), false);
  const broken = { ...destinations[0], lat: NaN };
  assert.equal(recommendNearby([broken], point('stone-town')).status, 'outside-coverage');
  assert.equal(recommendNearby([], point('stone-town')).status, 'outside-coverage');
});

test('category, query, saved and region filters compose with radius without changing origin coverage', () => {
  const origin = point('stone-town');
  const category = recommendNearby(destinations, origin, { category: 'culture', region: 'Zanzibar' });
  assert.deepEqual(category.destinations.map((item) => item.destination.id), ['stone-town']);
  const noCategory = recommendNearby(destinations, origin, { category: 'wildlife', maxDistanceKm: 1 });
  assert.equal(noCategory.status, 'no-matches');
  const noQuery = recommendNearby(destinations, origin, { query: 'unlisted-place' });
  assert.equal(noQuery.status, 'no-matches');
  const query = recommendNearby(destinations, origin, { query: 'PAJE' });
  assert.deepEqual(query.destinations.map((item) => item.destination.id), ['paje']);
  const saved = recommendNearby(destinations, origin, { savedOnly: true, savedIds: ['nungwi', 'serengeti'] });
  assert.deepEqual(saved.destinations.map((item) => item.destination.id), ['nungwi']);
  assert.equal(recommendNearby(destinations, origin, { savedOnly: true }).status, 'no-matches');
  assert.equal(noQuery.nearestDestination?.destination.id, 'stone-town');
});

test('experience kinds follow the source route even when a package is listed among excursions', () => {
  const result = recommendNearby(destinations, point('paje'), { experienceKinds: ['excursion'] });
  assert.ok(result.experiences.length > 0);
  assert.ok(result.experiences.every((item) => item.kind === 'excursion' && item.to.startsWith('/excursions/')));
  const packages = recommendNearby(destinations, point('paje'), { experienceKinds: ['package'] });
  assert.ok(packages.experiences.every((item) => item.to.startsWith('/packages/')));
  assert.equal(packages.experiences.filter((item) => item.id === '/packages/zanzibar-adventure-marine-package').length, 1);
});

test('radius and result limits remain useful and shared references keep the closest distance', () => {
  const limited = recommendNearby(destinations, point('nungwi'), { maxDistanceKm: 1, destinationLimit: 1, experienceLimit: 2 });
  assert.equal(limited.destinations.length, 1);
  assert.equal(limited.experiences.length, 2);
  assert.ok(limited.experiences.every((item) => item.destination.id === 'nungwi'));
  assert.equal(recommendNearby(destinations, point('nungwi'), { maxDistanceKm: Infinity }).radiusKm, 150);
  assert.equal(recommendNearby(destinations, point('nungwi'), { maxDistanceKm: -3 }).radiusKm, 150);
});

test('equal-distance ordering is deterministic and input arrays/catalog records stay unchanged', () => {
  const first = { ...destinations[0], id: 'a-hub' };
  const second = { ...destinations[0], id: 'z-hub' };
  const input = Object.freeze([Object.freeze(second), Object.freeze(first)]) as readonly Destination[];
  const result = recommendNearby(input, point('stone-town'));
  assert.deepEqual(result.destinations.map((item) => item.destination.id), ['a-hub', 'z-hub']);
  assert.ok(result.experiences.every((item) => item.destination.id === 'a-hub'));
  assert.deepEqual(input.map((item) => item.id), ['z-hub', 'a-hub']);
});

test('canonical routes deduplicate query/hash/trailing-slash variants and exclude external links', () => {
  const hub = {
    ...destinations[0],
    excursions: [
      { label: 'City tour', to: '/excursions/stone-town' },
      { label: 'Same city tour', to: '/excursions/stone-town/?from=nearby#details' },
      { label: 'External page', to: 'https://example.com/excursions/external' },
      { label: 'Website homepage', to: '/' },
    ],
    safaris: [], packages: [],
  };
  const result = recommendNearby([hub], point('stone-town'));
  assert.equal(result.experiences.length, 1);
  assert.equal(result.experiences[0].id, '/excursions/stone-town');
  assert.equal(result.experiences[0].label, 'City tour');
});

test('distance calculation handles identity, antimeridian and opposite points', () => {
  assert.equal(distanceKmBetween(point('stone-town'), point('stone-town')), 0);
  const acrossDateLine = distanceKmBetween({ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 })!;
  assert.ok(acrossDateLine > 22 && acrossDateLine < 23);
  const opposite = distanceKmBetween({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 })!;
  assert.ok(Number.isFinite(opposite) && opposite > 20000 && opposite < 20100);
  assert.equal(distanceKmBetween({ latitude: Infinity, longitude: 0 }, point('nungwi')), null);
});
