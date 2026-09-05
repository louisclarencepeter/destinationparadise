import assert from 'node:assert/strict';
import test from 'node:test';
import { weatherSceneState } from '../src/features/weather/weather-scene-state';

test('clear scenes show the actual day or night celestial body without clouds or rain', () => {
  assert.deepEqual(weatherSceneState(0, true), { kind: 'clear', celestial: 'sun', clouds: 0, precipitation: 'none' });
  assert.deepEqual(weatherSceneState(0, false), { kind: 'clear', celestial: 'moon', clouds: 0, precipitation: 'none' });
});
test('WMO fog, cloud and unknown codes never imply precipitation', () => {
  for (const code of [1, 2, 3, 45, 48, 95, -1, 4, 50, 70, 90, 100]) assert.equal(weatherSceneState(code, false).precipitation, 'none');
  assert.equal(weatherSceneState(3, true).celestial, 'none');
  assert.equal(weatherSceneState(48, true).kind, 'fog');
});
test('rain, snow and hail retain their actual provider meaning', () => {
  for (const code of [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]) assert.equal(weatherSceneState(code, true).precipitation, 'rain');
  for (const code of [71, 73, 75, 77, 85, 86]) assert.equal(weatherSceneState(code, true).precipitation, 'snow');
  for (const code of [96, 99]) assert.equal(weatherSceneState(code, true).precipitation, 'hail');
  assert.equal(weatherSceneState(95, true).kind, 'thunder');
});
