import { CATALOG } from '../dist/catalog.mjs';

const IDS = new Set(CATALOG.map(item => item.id));
const AUTH = 'https://arcamis.pages.dev/api/admin?action=';
const COOKIE = 'atlas_admin';
const MAX_BODY = 32768;
const cookie = (token, age) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const reply = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const error = status => reply({ ok: false, error: ({400:'Richiesta non valida',401:'Accesso richiesto',403:'Accesso negato',409:'Dati aggiornati da un altro amministratore',413:'Richiesta troppo grande',429:'Troppi tentativi',503:'Servizio temporaneamente non disponibile'})[status] || 'Richiesta non disponibile' }, status);
async function boundedJSON(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY) throw 413;
  const reader = request.body?.getReader();
  if (!reader) throw 400;
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); throw 413; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (e) { throw e === 413 ? 413 : 400; }
}
function sessionToken(request) {
  const matches = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).filter(v => v.startsWith(`${COOKIE}=`));
  if (matches.length !== 1) return null;
  const value = matches[0].slice(COOKIE.length + 1);
  return /^[a-f0-9]{64}$/.test(value) ? value : null;
}
async function upstream(fetcher, action, init = {}) {
  const response = await fetcher(AUTH + action, { ...init, redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (response.status >= 500 || response.status >= 300 && response.status < 400) throw 503;
  return response;
}
async function authJSON(response) {
  try { return await boundedJSON(response); } catch { throw 503; }
}
async function check(request, fetcher) {
  const token = sessionToken(request);
  if (!token) throw 401;
  const response = await upstream(fetcher, 'check', { headers: { Cookie: `arc_admin=${token}` } });
  const data = await authJSON(response);
  if (!response.ok || data.ok !== true) throw 401;
  if (typeof data.csrf !== 'string' || !data.csrf || typeof data.role !== 'string') throw 503;
  return { token, data: { ok: true, user: typeof data.user === 'string' ? data.user : '', role: data.role, csrf: data.csrf } };
}
function snapshot(row) {
  if (!row) throw 503;
  return { revision: row.revision, overrides: JSON.parse(row.overrides), updatedAt: row.updated_at };
}
async function read(db) { return snapshot(await db.prepare('SELECT revision, overrides, updated_at FROM atlas_names WHERE singleton = 1').bind().first()); }
async function limitLogin(request, db) {
  const now = Math.floor(Date.now() / 1000);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const bucket = `${Math.floor(now / 900)}:${Array.from(new Uint8Array(hash), v => v.toString(16).padStart(2, '0')).join('')}`;
  await db.prepare('DELETE FROM atlas_login_limits WHERE expires_at < ?').bind(now).run();
  const row = await db.prepare('INSERT INTO atlas_login_limits(bucket, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET attempts = attempts + 1 RETURNING attempts').bind(bucket, now + 900).first();
  if (!row || row.attempts > 10) throw 429;
}

export async function handleAtlas(request, env, options = {}) {
  let stage = 'setup';
  try {
    if (!env?.DB) throw 503;
    const db = env.DB;
    const fetcher = options.fetch || globalThis.fetch;
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (path === '/api/atlas/names' && method === 'GET') return reply(await read(db), 200, { 'Access-Control-Allow-Origin': '*' });
    if (['POST', 'PATCH', 'DELETE'].includes(method) && request.headers.get('Origin') !== url.origin) throw 403;
    if (path === '/api/atlas/session') {
      if (method === 'POST') {
        stage = 'login-limit';
        await limitLogin(request, db);
        const body = await boundedJSON(request);
        if (!body || typeof body.username !== 'string' || !body.username.trim() || body.username.length > 128 || typeof body.password !== 'string' || !body.password || body.password.length > 1024) throw 400;
        stage = 'login-upstream';
        const response = await upstream(fetcher, 'login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://arcamis.pages.dev' }, body: JSON.stringify({ username: body.username, password: body.password, remember: body.remember === true }) });
        stage = 'login-response';
        const data = await authJSON(response);
        if (!response.ok || data.ok !== true) throw response.status === 429 ? 429 : 401;
        const token = response.headers.get('Set-Cookie')?.match(/(?:^|[,;]\s*)arc_admin=([a-f0-9]{64})(?=;|,|$)/)?.[1];
        if (!token || typeof data.csrf !== 'string' || !data.csrf || typeof data.role !== 'string') throw 503;
        return reply({ ok: true, user: body.username, role: data.role, csrf: data.csrf }, 200, { 'Set-Cookie': cookie(token, body.remember === true ? 7776000 : 86400) });
      }
      if (method === 'GET') return reply((await check(request, fetcher)).data);
      if (method === 'DELETE') {
        const session = await check(request, fetcher);
        if (request.headers.get('X-CSRF-Token') !== session.data.csrf) throw 403;
        const response = await upstream(fetcher, 'logout', { method: 'POST', headers: { Cookie: `arc_admin=${session.token}`, 'X-CSRF-Token': session.data.csrf, Origin: 'https://arcamis.pages.dev' } });
        if (!response.ok) throw 503;
        return reply({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
      }
    }
    if (path === '/api/atlas/names' && method === 'PATCH') {
      const session = await check(request, fetcher);
      if (session.data.role !== 'admin' || request.headers.get('X-CSRF-Token') !== session.data.csrf) throw 403;
      const body = await boundedJSON(request);
      if (!body || !Number.isSafeInteger(body.revision) || body.revision < 0 || !Array.isArray(body.changes) || !body.changes.length || body.changes.length > 100) throw 400;
      const seen = new Set();
      for (const change of body.changes) {
        if (!change || !IDS.has(change.id) || seen.has(change.id) || change.name !== null && (typeof change.name !== 'string' || !change.name.trim() || [...change.name.trim()].length > 80 || /[\u0000-\u001f\u007f-\u009f]/u.test(change.name))) throw 400;
        seen.add(change.id);
      }
      const current = await read(db);
      if (current.revision !== body.revision) return reply({ ok: false, error: 'Conflitto di revisione', ...current }, 409);
      const overrides = { ...current.overrides };
      for (const { id, name } of body.changes) { if (name === null) delete overrides[id]; else overrides[id] = name.trim(); }
      const row = await db.prepare('UPDATE atlas_names SET revision = revision + 1, overrides = ?, updated_at = ? WHERE singleton = 1 AND revision = ? RETURNING revision, overrides, updated_at').bind(JSON.stringify(overrides), new Date().toISOString(), body.revision).first();
      if (!row) return reply({ ok: false, error: 'Conflitto di revisione', ...await read(db) }, 409);
      return reply(snapshot(row));
    }
    return error(404);
  } catch (e) {
    const status = [400,401,403,413,429,503].includes(e) ? e : 503;
    const response = error(status);
    if (status === 503) {
      console.error('Atlas service failure', stage, e instanceof Error ? e.name + ': ' + e.message : e);
      response.headers.set('X-Atlas-Failure', stage);
    }
    return response;
  }
}
