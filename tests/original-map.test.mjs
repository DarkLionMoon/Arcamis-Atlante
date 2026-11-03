import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getMap} from '../dist/core.mjs';
test('Marchesato is exactly the original supplied map, including the lake',async()=>{
 const file=await readFile(new URL('../dist/assets/marchesato.png',import.meta.url));
 assert.equal(createHash('sha256').update(file).digest('hex'),'942ffa074250f66bcf64c5fd1243bc292d464295c07afde7976fcfb2fd1a3d12');
 assert.ok(getMap('marchesato').places.some(p=>p.name==='Lago di Gromot'));
});
