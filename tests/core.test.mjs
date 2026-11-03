import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maps, getMap, searchPlaces, zoomAt, clampView } from '../dist/core.mjs';

test('six regional sheets and correct separate Valgari/Vigilius names', () => {
  assert.equal(maps.filter(m => m.id !== 'mondo').length, 6);
  assert.ok(getMap('valgari').places.some(p => p.name === 'Valgari'));
  assert.ok(getMap('marchesato').places.some(p => p.name === 'Vigilius'));
  assert.ok(!getMap('marchesato').places.some(p => p.name === 'Valgari'));
  assert.equal(getMap('non-esiste').id, 'mondo');
});
test('search finds places and regions, handles blank and unknown text', () => {
  assert.deepEqual(searchPlaces('   '), []);
  assert.equal(searchPlaces('VALGARI').some(p => p.mapId === 'valgari'), true);
  assert.equal(searchPlaces('artoria').find(p => p.name === 'Artoria').mapId, 'virturia');
  assert.equal(searchPlaces('zzzzzzz').length, 0);
});
test('zoom preserves point under cursor and limits zoom', () => {
  const v = zoomAt({x: 0, y: 0, scale: 1}, 2, {x: 100, y: 50});
  assert.deepEqual(v, {x: -100, y: -50, scale: 2});
  assert.equal(zoomAt(v, 100, {x: 0, y: 0}).scale, 5);
  assert.equal(zoomAt(v, 0.01, {x: 0, y: 0}).scale, 1);
});
test('pan limits keep the sheet in reach', () => {
  assert.deepEqual(clampView({x: 9999, y: -9999, scale: 2}, 1000, 600), {x: 0,y: -600,scale: 2});
});
