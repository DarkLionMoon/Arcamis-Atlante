import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleAtlas} from '../server/atlas-api.mjs';
import {CATALOG} from '../dist/catalog.mjs';
const token = 'a'.repeat(64);
function setup(role='admin') {
 const sqlite = new DatabaseSync(':memory:');
 sqlite.exec(readFileSync(new URL('../migrations/0001_atlas_names.sql',import.meta.url),'utf8'));
 const env={DB:{prepare(sql){return {bind(...args){return {first:async()=>sqlite.prepare(sql).get(...args),run:async()=>sqlite.prepare(sql).run(...args)}}}}}};
 const calls=[];
 const fetch=async(url,init)=>{calls.push({url,init});return Response.json({ok:true,user:'admin',role,csrf:'csrf'},{headers:{'Set-Cookie':`arc_admin=${token}; HttpOnly; Secure; Path=/`}})};
 const request=(path,method='GET',body,headers={})=>handleAtlas(new Request(`https://atlas.example/api/atlas/${path}`,{method,headers:{Origin:'https://atlas.example',Cookie:`atlas_admin=${token}`,'X-CSRF-Token':'csrf',...headers},body:body===undefined?undefined:JSON.stringify(body)}),env,{fetch});
 return {request,env,fetch,calls};
}
const change={revision:0,changes:[{id:CATALOG[0]?.id,name:' Nome nuovo '}]};
test('public snapshot permits cross-origin reads',async()=>{const {request}=setup();const r=await request('names');assert.equal(r.status,200);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'*');assert.deepEqual((await r.json()).overrides,{});});
test('writes require session, admin role, CSRF and matching origin',async()=>{
 for(const [role,headers,status] of [['admin',{Cookie:''},401],['reader',{},403],['admin',{'X-CSRF-Token':'wrong'},403],['admin',{Origin:'https://evil.example'},403],['admin',{Origin:''},403]]){const {request}=setup(role);assert.equal((await request('names','PATCH',change,headers)).status,status);}
});
test('saves trim names, reset overrides and reject stale revisions',async()=>{const {request}=setup();let r=await request('names','PATCH',change);assert.equal(r.status,200);assert.equal((await r.json()).overrides[CATALOG[0].id],'Nome nuovo');assert.equal((await request('names','PATCH',change)).status,409);r=await request('names','PATCH',{revision:1,changes:[{id:CATALOG[0].id,name:null}]});assert.deepEqual((await r.json()).overrides,{});});
test('rejects unknown IDs, empty/long/control names and oversized bodies',async()=>{const {request}=setup();for(const item of [{id:'unknown',name:'ok'},{id:CATALOG[0].id,name:''},{id:CATALOG[0].id,name:'x'.repeat(81)},{id:CATALOG[0].id,name:'a\nb'}])assert.equal((await request('names','PATCH',{revision:0,changes:[item]})).status,400);assert.equal((await request('names','PATCH',{padding:'x'.repeat(40000)})).status,413);});
test('login uses fixed upstream, isolates cookie and rate limits attempts',async()=>{const {request,calls}=setup();const r=await request('session','POST',{username:'admin',password:'secret',remember:true});assert.equal(r.status,200);assert.match(r.headers.get('Set-Cookie'),/^atlas_admin=a{64};.*HttpOnly.*Secure.*SameSite=Strict/);assert.doesNotMatch(await r.text(),/secret|a{64}/);assert.equal(calls[0].url,'https://arcamis.pages.dev/api/admin?action=login');assert.equal(calls[0].init.redirect,'manual');for(let i=0;i<9;i++)await request('session','POST',{username:'a',password:'b'});assert.equal((await request('session','POST',{username:'a',password:'b'})).status,429);});
test('session is no-store and upstream failure closes writes',async()=>{const {request,env}=setup();assert.equal((await request('session')).headers.get('Cache-Control'),'no-store');const r=await handleAtlas(new Request('https://atlas.example/api/atlas/names',{method:'PATCH',headers:{Origin:'https://atlas.example',Cookie:`atlas_admin=${token}`},body:JSON.stringify(change)}),env,{fetch:async()=>{throw Error('secret')}});assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/secret/);});
test('missing database fails closed',async()=>{assert.equal((await handleAtlas(new Request('https://atlas.example/api/atlas/names'),{})).status,503);});
test('failed login or invalid upstream session cannot authorize',async()=>{const {env}=setup();for(const method of ['POST','GET']){const r=await handleAtlas(new Request('https://atlas.example/api/atlas/session',{method,headers:{Origin:'https://atlas.example',Cookie:`atlas_admin=${token}`},body:method==='POST'?JSON.stringify({username:'a',password:'b'}):undefined}),env,{fetch:async()=>Response.json({ok:false})});assert.equal(r.status,401);assert.equal(r.headers.get('Set-Cookie'),null);}});
test('logout revokes upstream session and clears isolated cookie',async()=>{const {request,calls}=setup();const r=await request('session','DELETE');assert.equal(r.status,200);assert.match(r.headers.get('Set-Cookie'),/atlas_admin=;.*Max-Age=0/);assert.equal(calls[1].url,'https://arcamis.pages.dev/api/admin?action=logout');assert.equal(calls[1].init.headers.Cookie,`arc_admin=${token}`);});
test('simultaneous saves cannot overwrite a revision',async()=>{const {request}=setup();const results=await Promise.all([request('names','PATCH',change),request('names','PATCH',{...change,changes:[{id:CATALOG[0].id,name:'altro'}]})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);});

test('upstream redirects are rejected without forwarding credentials',async()=>{
 const {env}=setup();let calls=0;
 const r=await handleAtlas(new Request('https://atlas.example/api/atlas/session',{method:'POST',headers:{Origin:'https://atlas.example'},body:JSON.stringify({username:'admin',password:'secret'})}),env,{fetch:async(url,init)=>{calls++;assert.equal(init.redirect,'manual');return new Response(null,{status:302,headers:{Location:'https://other.example'}});}});
 assert.equal(r.status,503);assert.equal(calls,1);assert.equal(r.headers.get('Set-Cookie'),null);
});
