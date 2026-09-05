import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultPreferences, normalizePreferences, normalizeSavedIds } from '../src/state/preferences';

test('default travel month follows Zanzibar date at month boundary', () => {
  assert.equal(createDefaultPreferences(new Date('2026-08-31T22:00:00Z')).month, 'September');
});

test('saved preferences preserve selected month without inventing exact dates', () => {
  const result = normalizePreferences({ month: 'September', nights: 12, adults: 3, destinationId: 'serengeti' });
  assert.equal(result.month, 'September');
  assert.equal(result.nights, 12);
  assert.equal(result.destinationId, 'serengeti');
  assert.equal('startDate' in result, false);
});

test('corrupt persisted input cannot create invalid party sizes or enum values', () => {
  const fallback = createDefaultPreferences(new Date('2026-09-05T00:00:00Z'));
  const result = normalizePreferences({ month: 'Sep<script>', nights: -5, adults: 0, children: '2', pace: 'warp', budget: null, interests: ['Ocean', 'Ocean', 42], destinationId: '../../bad' }, fallback);
  assert.equal(result.month, 'September');
  assert.equal(result.nights, 9);
  assert.equal(result.adults, 2);
  assert.equal(result.children, 0);
  assert.equal(result.destinationId, null);
  assert.deepEqual(result.interests, ['Ocean']);
});

test('saved places discard unknown identifiers and duplicates', () => {
  assert.deepEqual(normalizeSavedIds(['stone-town', 'bad', 'stone-town', 2, 'serengeti'], ['stone-town', 'serengeti']), ['stone-town', 'serengeti']);
});
