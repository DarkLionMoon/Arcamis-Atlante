import test from 'node:test';
import assert from 'node:assert/strict';
import {landmarks} from '../dist/landmarks.mjs';
import {buildDetails} from '../dist/details.mjs';
import {labelTier,placeLabels,regionForPlace} from '../dist/label-layout.mjs';

test('all named settlements have one landmark and a bounded clearing',()=>{
 const names=['Aurenthar','Valoria','Artoria','Valgari','Forte Vigilus','Arcamis','Volonx','Vigilius','Galeton','Riva di Ferro','Fumofosco','Vallespiga'];
 assert.deepEqual([...landmarks.map(l=>l.name)].sort(),names.sort());
 for(const l of landmarks){assert.ok(l.u>0&&l.u<1&&l.v>0&&l.v<1);const[x,y,right,bottom]=l.clear;assert.ok(x<l.u&&l.u<right&&y<l.v&&l.v<bottom,l.name);assert.ok(x>=0&&right<=1&&y>=0&&bottom<=1);assert.ok(right-x<.13&&bottom-y<.18);}
 assert.equal(regionForPlace.Valoria,'virturia');assert.equal(regionForPlace.Artoria,'virturia');
});
test('landmarks produce complete finite triangle geometry without tree models',()=>{
 const mesh=buildDetails(()=>[70,100,30],()=>.08,landmarks);assert.equal(mesh.trees,0);assert.equal(mesh.treeCount,0);assert.equal(mesh.ranges.length,landmarks.length);assert.ok(mesh.vertices.every(Number.isFinite));assert.equal(mesh.vertices.length,mesh.totalCount*9);
 let end=0;for(const r of mesh.ranges){assert.equal(r.start,end);assert.ok(r.count>200,r.name);assert.equal(r.count%3,0);end+=r.count;}assert.equal(end,mesh.totalCount);
});
test('labels progress from regions to cities and minor places',()=>{
 assert.equal(labelTier('Aurenthar',1),'region');assert.equal(labelTier('Aurenthar',2),'city');assert.equal(labelTier('Artoria',1),null);assert.equal(labelTier('Artoria',2),'city');assert.equal(labelTier('Volonx',2),null);assert.equal(labelTier('Volonx',4),'place');
});
test('labels avoid each other, screen edges and interface panels',()=>{
 const r={x:100,y:150,width:100,height:40};const items=[{id:'minor',priority:1,rect:r},{id:'city',priority:10,rect:r},{id:'outside',priority:20,rect:{...r,x:-10}}];assert.deepEqual([...placeLabels(items,800,600)],['city']);
 assert.deepEqual([...placeLabels(items,800,600,[r])],[]);
 const positions=new Map();assert.deepEqual([...placeLabels([{id:'region',priority:1,rect:r,alternatives:[{...r,y:220}]}],800,600,[r],positions)],['region']);assert.equal(positions.get('region').y,220);
});
