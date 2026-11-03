import {test} from 'node:test';
import assert from 'node:assert/strict';
import {worldPlaces,worldPlace,cameraForRegion} from '../dist/world.mjs';
test('all regional places share one world coordinate space',()=>{for(const p of worldPlaces){assert.ok(p.x>=0&&p.x<=100);assert.ok(p.y>=0&&p.y<=100);}assert.equal(worldPlace('valgari','Valgari').x,53);assert.equal(worldPlace('marchesato','Vigilius').name,'Vigilius');});
test('region focus produces a zoomed camera on the same world',()=>{const a=cameraForRegion('valgari',1000,600);assert.equal(a.scale,4);assert.equal(a.x,500-530*4);assert.deepEqual(cameraForRegion('invalid',1000,600),{x:0,y:0,scale:1});});
