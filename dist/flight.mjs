import {buildDetails,DetailRenderer} from './details.mjs';
import {applyNames,displayName,entityId,createNameCorrections,PUBLIC_ORIGIN} from './catalog.mjs';
const $=id=>document.getElementById(id),canvas=$('terrain'),gl=canvas.getContext('webgl2',{antialias:true,alpha:false});
if(!gl){location.replace('classic.html'+location.hash);throw Error('WebGL2 unavailable');}
const vs=`#version 300 es
precision highp float;
in vec3 position;in vec3 normal;in vec2 uv;
uniform vec2 center;uniform float distance;uniform float tilt;uniform float aspect;uniform float focal;
out vec2 tex;out vec3 norm;out float depth;
void main(){vec3 p=position-vec3(center,0.);float s=sin(tilt),c=cos(tilt);depth=distance-p.y*s-p.z*c;float vertical=-p.y*c+p.z*s;gl_Position=vec4(p.x*focal/aspect,vertical*focal,(100.05/99.95)*depth-.10005,depth);tex=uv;norm=normal;}`;
const fs=`#version 300 es
precision highp float;
uniform sampler2D image;uniform float tilt;uniform float distance;
in vec2 tex;in vec3 norm;in float depth;out vec4 color;
void main(){vec3 base=texture(image,tex).rgb;float light=max(0.,dot(normalize(norm),normalize(vec3(-.5,-.8,1.6))));vec3 lit=base*(.86+.19*light);float haze=smoothstep(.8,2.6,depth/distance)*.15*sin(tilt);color=vec4(mix(lit,vec3(.23,.38,.39),haze),1.);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
const uniforms=Object.fromEntries(['center','distance','tilt','aspect','focal','image'].map(k=>[k,gl.getUniformLocation(program,k)]));
const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer(),ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
for(const [name,size,offset] of [['position',3,0],['normal',3,12],['uv',2,24]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,32,offset);}
const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
const W=16,H=9,focal=1/Math.tan(40*Math.PI/360),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=t=>(t=clamp(t,0,1))*t*(3-2*t);
const target={x:0,y:0,zoom:1},camera={...target};let active='world',count=0,ready=false,loadID=0,last=0,pins=[],height=()=>0;
const maps={
 world:{url:'assets/world-v2.png',asset:'world-continuous',title:'Le terre conosciute',ridges:[[.035,.06,.065,.06,.6],[.075,.14,.06,.055,.65],[.105,.23,.055,.055,.52],[.07,.30,.05,.035,.36],[.77,.09,.032,.024,.35],[.82,.15,.036,.03,.3],[.855,.19,.035,.027,.25],[.59,.70,.035,.020,.20],[.625,.72,.034,.025,.28],[.66,.735,.035,.025,.24],[.845,.737,.026,.018,.16]],pins:[['Aurenthar',.32,.37],['Valgari',.525,.445],['Arcamis',.90,.585],['Forte Vigilus',.497,.63],['Volonx',.943,.648],['Vigilius',.825,.733],['Galeton',.855,.858],['Riva di Ferro',.542,.866],['Fumofosco',.641,.729],['Rovine di Kaldur',.674,.874],['Lago di Gromot',.911,.741],['Foresta Infinita',.40,.565],['Baronie di Dolkrid',.32,.70],['Foreste Antiche',.10,.62],['Virturia',.57,.14]]},
 march:{asset:'marchesato',title:'Marchesato di Arcamis',ridges:[[.36,.405,.038,.025,.24],[.405,.43,.038,.03,.28],[.455,.445,.038,.027,.22],[.82,.505,.032,.023,.22]],pins:[['Forte Vigilus',.182,.34],['Volonx',.946,.36],['Arcamis',.88,.27],['Vigilius',.775,.52],['Lago di Gromot',.907,.51],['Rovine di Kaldur',.53,.73]]}
};
function dimensions(cam=camera){const aspect=canvas.clientWidth/canvas.clientHeight,base=Math.max(H,W/aspect)*focal*.57;return {aspect,distance:base/cam.zoom,tilt:smooth((cam.zoom-1.05)/2.45)*52*Math.PI/180,focal};}
const details=new DetailRenderer(gl,dimensions);
function ground(screen,cam=camera){const {aspect,distance,tilt}=dimensions(cam),nx=(screen.x/canvas.clientWidth*2-1)*aspect/focal,ny=(1-screen.y/canvas.clientHeight*2)/focal,s=Math.sin(tilt),c=Math.cos(tilt),t=distance*c/Math.max(.1,c-ny*s);return {x:cam.x+nx*t,y:cam.y+distance*s+(-ny*c-s)*t};}
function project(x,y,z){const {aspect,distance,tilt}=dimensions(),s=Math.sin(tilt),c=Math.cos(tilt),dx=x-camera.x,dy=y-camera.y,depth=distance-dy*s-z*c;return {x:(dx*focal/aspect/depth+1)*canvas.clientWidth/2,y:(1-(-dy*c+z*s)*focal/depth)*canvas.clientHeight/2,depth};}
function limits(){target.x=clamp(target.x,-W*.46,W*.46);target.y=clamp(target.y,-H*.43,H*.43);}
function zoomTo(factor,point={x:canvas.clientWidth/2,y:canvas.clientHeight/2}){if($('sheet-dialog').open)return;const before=ground(point,target);target.zoom=clamp(target.zoom*factor,1,6);const after=ground(point,target);target.x+=before.x-after.x;target.y+=before.y-after.y;if(target.zoom===1){target.x=0;target.y=0;}limits();}
function reset(){Object.assign(target,{x:0,y:0,zoom:1});}
async function load(key){const id=++loadID;ready=false;$('loading').hidden=false;const img=new Image();img.src=maps[key].url||'/assets/'+maps[key].asset+'.png';await img.decode();if(id!==loadID)return;active=key;const sampler=document.createElement('canvas');sampler.width=512;sampler.height=288;const ctx=sampler.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,512,288);const data=ctx.getImageData(0,0,512,288).data;
 const sample=(u,v)=>{const i=(clamp(Math.round(v*287),0,287)*512+clamp(Math.round(u*511),0,511))*4;return [data[i],data[i+1],data[i+2]];};
 const land=(u,v)=>{const[r,g,b]=sample(u,v);return !(g>r*1.08&&b>r*1.05);};
 height=(u,v)=>{if(u<.015||u>.985||v<.02||v>.98||!land(u,v))return 0;let h=0;for(const[x,y,rx,ry,z]of maps[key].ridges){const d=((u-x)/rx)**2+((v-y)/ry)**2;h+=Math.exp(-d*1.5)*z;}return h*(.88+.08*Math.sin(u*280+v*190)+.04*Math.sin(u*510-v*310));};
 const cols=384,rows=216,vertices=new Float32Array((cols+1)*(rows+1)*8),indices=new Uint32Array(cols*rows*6),du=1/cols,dv=1/rows;let n=0;
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,v=j/rows,z=height(u,v),dx=(height(u+du,v)-height(u-du,v))/(2*du*W),dy=(height(u,v+dv)-height(u,v-dv))/(2*dv*H),l=Math.hypot(dx,dy,1);vertices.set([(u-.5)*W,(v-.5)*H,z,-dx/l,-dy/l,1/l,u,v],n);n+=8;}
 n=0;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=a+cols+1;indices.set([a,b,c,b,c+1,c],n);n+=6;}
 gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);count=indices.length;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);const aniso=gl.getExtension('EXT_texture_filter_anisotropic');if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
 const cities=key==='march'?[['fort',.182,.34],['fort',.946,.35],['capital',.88,.27],['fort',.775,.52],['village',.835,.735],['village',.225,.745]]:[['capital',.309,.37],['fort',.525,.445],['capital',.90,.585],['fort',.943,.648],['fort',.825,.733],['fort',.497,.63],['village',.855,.858],['village',.542,.866],['fort',.34,.14],['fort',.73,.14]];
 details.setSource(buildDetails(sample,height,cities));
 $('labels').replaceChildren();pins=maps[key].pins.map(([name,u,v])=>{const el=document.createElement('div');el.className='pin';const span=document.createElement('span');span.textContent=name;el.append(span);$('labels').append(el);return {el,u,v};});$('world').setAttribute('aria-pressed',String(key==='world'));$('heading').textContent=maps[key].title;reset();Object.assign(camera,target);ready=true;$('loading').hidden=true;
}
function frame(now){const dt=Math.min(80,now-last||16);last=now;const a=matchMedia('(prefers-reduced-motion:reduce)').matches?1:1-Math.exp(-dt/115);for(const k of ['x','y','zoom'])camera[k]+=(target[k]-camera[k])*a;
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.055,.16,.17,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 if(ready){const d=dimensions();gl.enable(gl.DEPTH_TEST);gl.useProgram(program);gl.bindVertexArray(vao);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(uniforms.image,0);gl.uniform2f(uniforms.center,camera.x,camera.y);gl.uniform1f(uniforms.distance,d.distance);gl.uniform1f(uniforms.tilt,d.tilt);gl.uniform1f(uniforms.aspect,d.aspect);gl.uniform1f(uniforms.focal,focal);gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_INT,0);
 details.draw(camera);
 for(const {el,u,v} of pins){const p=project((u-.5)*W,(v-.5)*H,height(u,v));el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.opacity=p.depth>0&&(camera.zoom>1.7||['Aurenthar','Valgari','Arcamis','Baronie di Dolkrid','Foreste Antiche','Virturia','Foresta Infinita'].includes(el.dataset.defaultName||el.textContent))?'1':'0';} $('zoom').textContent=Math.round(camera.zoom*100)+'%';$('pitch').textContent=d.tilt<.01?'VISTA DALL’ALTO':`CAMERA INCLINATA · ${Math.round(d.tilt*180/Math.PI)}°`;
 }requestAnimationFrame(frame);}
canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoomTo(Math.exp(-clamp(e.deltaY,-200,200)*.002),{x:e.clientX-r.left,y:e.clientY-r.top});},{passive:false});
const pointers=new Map();let lastPinch=0;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.offsetX,y:e.offsetY});lastPinch=0;});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId),next={x:e.offsetX,y:e.offsetY};pointers.set(e.pointerId,next);if(pointers.size===2){const [p,q]=[...pointers.values()],distance=Math.hypot(p.x-q.x,p.y-q.y);if(lastPinch)zoomTo(distance/lastPinch,{x:(p.x+q.x)/2,y:(p.y+q.y)/2});lastPinch=distance;}else{const from=ground(prev,target),to=ground(next,target);target.x+=from.x-to.x;target.y+=from.y-to.y;limits();}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{pointers.delete(e.pointerId);lastPinch=0;});
$('plus').onclick=()=>zoomTo(1.45);$('minus').onclick=()=>zoomTo(1/1.45);$('home').onclick=reset;$('world').onclick=()=>{reset();$('heading').textContent=maps.world.title;closeMenus();};
window.addEventListener('keydown',e=>{if($('sheet-dialog').open||e.target.closest('input,textarea,select'))return;if(e.key==='+'||e.key==='=')zoomTo(1.3);if(e.key==='-')zoomTo(1/1.3);if(e.key==='Home')reset();});
function fail(error){$('loading').hidden=false;$('loading').textContent='Impossibile caricare la mappa: '+error.message;console.error(error);}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;fail(Error('Contesto grafico interrotto. Ricarica la pagina.'));});
requestAnimationFrame(frame);load('world').then(()=>{refreshNames();navigateHash();}).catch(fail);

const regions={
 arcamis:{name:'Marchesato di Arcamis',asset:'marchesato',x:.75,y:.73,zoom:2.65},
 aurenthar:{name:'Aurenthar e le Pianure Centrali',asset:'aurenthar',x:.31,y:.40,zoom:2.9},
 virturia:{name:'Ducato di Virturia',asset:'virturia',x:.61,y:.18,zoom:2.3},
 dolkrid:{name:'Baronie di Dolkrid',asset:'dolkrid',x:.31,y:.68,zoom:3},
 valgari:{name:'Contea di Valgari',asset:'valgari',x:.51,y:.46,zoom:3.8},
 foreste:{name:'Foreste Antiche',asset:'foreste'}
};
function closeMenus(){for(const id of ['region-menu','sheet-menu'])$(id).open=false;}
const regionID=key=>'region.'+({arcamis:'marchesato'}[key]||key);
let focusedRegion=null,openedSheet=null;
function regionName(key){return displayName(regionID(key),regions[key].name);}
function focusRegion(key){const r=regions[key];if(!r||r.x===undefined)return;closeMenus();focusedRegion=key;Object.assign(target,{x:(r.x-.5)*W,y:(r.y-.5)*H,zoom:r.zoom});$('heading').textContent=regionName(key);$('world').setAttribute('aria-pressed','false');}
for(const button of document.querySelectorAll('[data-region]'))button.onclick=()=>{const key=button.dataset.region;focusRegion(key);history.replaceState(null,'','#'+({arcamis:'marchesato'}[key]||key));};
function sheetNames(){if(!openedSheet)return;$('sheet-art').querySelector('svg')?.remove();if(openedSheet==='arcamis')$('sheet-art').append(createNameCorrections('marchesato'));$('sheet-title').textContent=regionName(openedSheet);$('sheet-image').alt='Tavola illustrata: '+regionName(openedSheet);}
for(const button of document.querySelectorAll('[data-sheet]'))button.onclick=()=>{const key=button.dataset.sheet,r=regions[key];closeMenus();openedSheet=key;$('sheet-error').hidden=true;$('sheet-image').src='/assets/'+r.asset+'.png';sheetNames();$('sheet-dialog').showModal();};
$('sheet-close').onclick=()=>$('sheet-dialog').close();
$('sheet-image').onerror=()=>$('sheet-error').hidden=false;
$('sheet-dialog').addEventListener('click',e=>{if(e.target===$('sheet-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
for(const id of ['region-menu','sheet-menu'])$(id).addEventListener('toggle',()=>{if($(id).open)$(id==='region-menu'?'sheet-menu':'region-menu').open=false;});
const aliases={marchesato:'arcamis'};
function navigateHash(){const key=location.hash.slice(1);if(key==='mondo'){reset();focusedRegion=null;$('heading').textContent=maps.world.title;$('world').setAttribute('aria-pressed','true');}else if(regions[aliases[key]||key])focusRegion(aliases[key]||key);}
window.addEventListener('hashchange',navigateHash);
$('world').onclick=()=>{closeMenus();history.replaceState(null,'','#mondo');navigateHash();};
function pinName(pin){const name=pin.el.dataset.defaultName||pin.el.textContent;pin.el.dataset.defaultName=name;return displayName(name==='Virturia'?'region.virturia':entityId(name),name);}
function updateNames(){for(const pin of pins)pin.el.querySelector('span').textContent=pinName(pin);for(const b of document.querySelectorAll('[data-region]'))b.textContent='Esplora '+regionName(b.dataset.region);for(const b of document.querySelectorAll('[data-sheet]'))b.textContent=regionName(b.dataset.sheet);if(focusedRegion)$('heading').textContent=regionName(focusedRegion);sheetNames();if($('place-search').value)renderSearch();}
async function refreshNames(){try{const origin=location.hostname.endsWith('.chatgpt.site')?PUBLIC_ORIGIN:'';const response=await fetch(origin+'/api/atlas/names',{cache:'no-store'});if(!response.ok)return;const data=await response.json();applyNames(data.overrides);updateNames();}catch{/* Keep the cartographic names when the service is unavailable. */}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshNames();});
function renderSearch(){const q=$('place-search').value.trim().toLocaleLowerCase('it'),list=$('place-results');list.replaceChildren();list.hidden=!q;if(!q)return;const items=[...Object.keys(regions).filter(k=>regions[k].x!==undefined).map(key=>({name:regionName(key),original:regions[key].name,action:()=>focusRegion(key)})),...pins.map(p=>({name:pinName(p),original:p.el.dataset.defaultName,action:()=>{focusedRegion=null;Object.assign(target,{x:(p.u-.5)*W,y:(p.v-.5)*H,zoom:4});$('heading').textContent=pinName(p);}}))].filter(item=>[item.name,item.original].some(n=>n?.toLocaleLowerCase('it').includes(q))).slice(0,12);if(!items.length){const p=document.createElement('p');p.textContent='Nessun luogo trovato.';p.style.padding='0 12px';list.append(p);}for(const item of items){const b=document.createElement('button');b.textContent=item.name;b.onclick=()=>{item.action();$('place-search').value='';list.hidden=true;};list.append(b);}}
$('place-search').addEventListener('input',renderSearch);
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();$('place-results').hidden=true;}});
