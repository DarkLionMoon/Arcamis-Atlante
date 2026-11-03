import {test} from 'node:test';
import assert from 'node:assert/strict';
import {elevationAt,buildTerrainMesh} from '../dist/terrain.mjs';
test('reconstructed mountain ranges rise above plains; sea remains flat',()=>{
 assert.equal(elevationAt(.05,.08,0),0);
 assert.ok(elevationAt(.06,.1,1)>elevationAt(.4,.5,1)*3);
 assert.ok(elevationAt(.82,.12,1)>elevationAt(.4,.5,1)*3);
});
test('terrain mesh carries finite positions, normals and valid triangle indices',()=>{
 const mesh=buildTerrainMesh(20,12,()=>1);
 assert.equal(mesh.vertices.length,21*13*6);
 assert.equal(mesh.indices.length,20*12*6);
 assert.ok([...mesh.vertices].every(Number.isFinite));
 assert.ok([...mesh.indices].every(i=>i<21*13));
});
