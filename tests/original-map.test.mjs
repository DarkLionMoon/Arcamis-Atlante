import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getMap} from '../dist/core.mjs';
test('updated Marchesato geographic reference is preserved, including the lake',async()=>{
 const file=await readFile(new URL('../dist/assets/references/marchesato-aggiornato.png',import.meta.url));
 assert.equal(createHash('sha256').update(file).digest('hex'),'03a0736f83dd9dd7d1daf6888cf7b32345d9f0203236d7e517622fa7ce7ec899');
 assert.ok(getMap('marchesato').places.some(p=>p.name==='Lago di Gromot'));
});
