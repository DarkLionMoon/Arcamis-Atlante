import {maps} from './core.mjs';
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const originals=structuredClone(maps);
export function entityId(name){const region=originals.slice(1).find(m=>m.name===name);return region?'region.'+region.id:'place.'+slug(name);}
export function placeEntity(mapId,index){return entityId(originals.find(m=>m.id===mapId).places[index].name);}
const extra=[
 {name:'Foresta Infinita',kind:'Foresta',group:'Marchesato di Arcamis'},
 {name:'Selva Fogliabruna',kind:'Foresta',group:'Marchesato di Arcamis'},
 {name:'Foresta dello Smarrimento',kind:'Foresta',group:'Marchesato di Arcamis'},
];
const entries=originals.slice(1).flatMap(m=>[{id:'region.'+m.id,name:m.name,group:m.name,kind:'Regione'},...m.places.map(p=>({id:entityId(p.name),name:p.name,group:m.name,kind:p.kind}))]);
for(const e of extra)entries.push({...e,id:entityId(e.name)});
export const CATALOG=Object.freeze([...new Map(entries.map(e=>[e.id,e])).values()].map(Object.freeze));
const defaults=new Map(CATALOG.map(e=>[e.id,e.name]));
export const PUBLIC_ORIGIN='https://arcamis-atlante.pages.dev';
let currentOverrides={};
export function displayName(id,fallback=''){return currentOverrides[id]??defaults.get(id)??fallback;}
export function hasNameOverride(id){return Object.hasOwn(currentOverrides,id);}
export function applyNames(overrides={}){
 currentOverrides=Object.fromEntries(Object.entries(overrides).filter(([id,name])=>defaults.has(id)&&typeof name==='string'&&name.trim().length));
 for(const original of originals){const target=maps.find(m=>m.id===original.id),id='region.'+original.id;target.name=displayName(id,original.name);target.short=currentOverrides[id]??original.short;target.places.forEach((p,i)=>{p.name=displayName(entityId(original.places[i].name),original.places[i].name);});}
}
export const MARCH_LABELS=[
 ['Foresta Infinita',10.8,18.8,-46,4.7,'land'],['Forte Vigilus',18.2,30.4,-4,2.5,'land'],
 ['Vallespiga',20.0,48.0,19,3.7,'land'],['Fumofosco',42,52.0,0,2.5,'land'],
 ['Riva di Ferro',22.8,71,-7,2.5,'land'],['Rovine di Kaldur',52.6,72.3,-5,2.5,'land'],
 ['Vigilius',77.2,55.2,0,2.5,'land'],['Galeton',84,72.3,-6,2.5,'land'],
 ['Arcamis',88.2,27.8,5,2.5,'land'],['Volonx',94.6,39.1,0,2.5,'land'],
 ['Selva Fogliabruna',83,24,-21,1.8,'land'],['Foresta dello Smarrimento',91.5,43,-1,1.8,'land'],
 ['Lago di Gromot',90.6,50.4,-54,1.7,'water'],['Mar di Astra',52,13,0,5.0,'sea'],['Mare di Acuda',31.3,93,0,4.7,'sea'],
].map(([name,x,y,angle,size,style])=>({id:entityId(name),name,x,y,angle,size,style}));
// Match the cartographic sea spelling on the Marchesato while sharing its editable entity.
MARCH_LABELS[MARCH_LABELS.length-1].name='Mar di Acuda';
export const WORLD_LABELS=[{id:entityId('Foresta Infinita'),name:'Foresta Infinita',x:43.5,y:58.8,angle:-5,size:2.6,style:'land'}];
export function createLabels(sheet,documentRef=document){
 const ns='http://www.w3.org/2000/svg',svg=documentRef.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1000 562.5');svg.classList.add('cartographic-labels');svg.setAttribute('aria-hidden','true');
 for(const l of sheet==='marchesato'?MARCH_LABELS:WORLD_LABELS){const text=documentRef.createElementNS(ns,'text'),x=l.x*10,y=l.y*5.625;text.setAttribute('x',x);text.setAttribute('y',y);text.setAttribute('transform',`rotate(${l.angle} ${x} ${y})`);text.setAttribute('font-size',l.size*5.625);text.setAttribute('text-anchor','middle');text.setAttribute('class','map-ink '+l.style);text.dataset.entityId=l.id;text.textContent=currentOverrides[l.id]??l.name;svg.append(text);}
 return svg;
}
// Corrections stay separate from the supplied illustration; only changed names get a plate.
export function createNameCorrections(sheet,documentRef=document){
 const ns='http://www.w3.org/2000/svg',svg=documentRef.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1000 562.5');svg.classList.add('cartographic-labels');svg.setAttribute('aria-hidden','true');
 if(sheet!=='marchesato')return svg;
 for(const l of MARCH_LABELS){if(!hasNameOverride(l.id))continue;const x=l.x*10,y=l.y*5.625,size=Math.max(11,l.size*5.625),name=displayName(l.id),group=documentRef.createElementNS(ns,'g');group.setAttribute('transform',`translate(${x} ${y}) rotate(${l.angle})`);const width=Math.max(name.length,l.name.length)*size*.64+18;const rect=documentRef.createElementNS(ns,'rect');for(const [k,v]of Object.entries({x:-width/2,y:-size*1.05,width,height:size*1.5,rx:2,fill:'#13251f',stroke:'#c9aa70','stroke-width':.8}))rect.setAttribute(k,v);const text=documentRef.createElementNS(ns,'text');text.setAttribute('font-size',size);text.setAttribute('text-anchor','middle');text.setAttribute('fill','#f1dfa7');text.setAttribute('font-family','Georgia,serif');text.dataset.entityId=l.id;text.textContent=name;group.append(rect,text);svg.append(group);}
 return svg;
}
