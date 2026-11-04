import http from 'node:http';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const assets=path.resolve(root,'../../dist/assets');
const types={'.html':'text/html','.mjs':'text/javascript','.png':'image/png'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),base=url.pathname.startsWith('/assets/')?assets:root,relative=url.pathname.startsWith('/assets/')?url.pathname.slice(8):url.pathname.startsWith('/preview-assets/')?'assets/'+url.pathname.slice(16):url.pathname==='/'?'index.html':url.pathname.slice(1),file=path.resolve(base,relative);if(!file.startsWith(base+path.sep))throw Error();const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}}).listen(4186,'127.0.0.1',()=>console.log('http://127.0.0.1:4186'));
