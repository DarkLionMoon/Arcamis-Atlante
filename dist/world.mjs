import {maps,getMap} from './core.mjs';
import {entityId,displayName} from './catalog.mjs';
export const regionViews={mondo:{x:50,y:50,scale:1},aurenthar:{x:33,y:43,scale:2.5},valgari:{x:53,y:57,scale:4},marchesato:{x:75,y:77,scale:2.8},virturia:{x:58,y:20,scale:2.2},dolkrid:{x:31,y:64,scale:3.5},foreste:{x:12,y:66,scale:3}};
const locations={aurenthar:[[32,35],[13,20],[12,64]],valgari:[[53,57],[69,43]],marchesato:[[85,60],[93,69],[78,73],[87,84],[64,76],[60,86],[51,73],[56,79],[73,87],[91,76]],virturia:[[34,14],[73,14],[86,8],[88,34],[13,20]],dolkrid:[[35,90],[35,49],[31,64]],foreste:[[12,64],[27,47],[18,92]]};
export const worldPlaces=maps.slice(1).flatMap(m=>m.places.map((p,i)=>({...p,entityId:entityId(p.name),defaultName:p.name,mapId:m.id,x:locations[m.id][i][0],y:locations[m.id][i][1]})));
export function worldPlace(mapId,name){return worldPlaces.find(p=>p.mapId===mapId&&p.name===name);}
export function cameraForRegion(id,width,height){const r=regionViews[getMap(id).id];return {scale:r.scale,x:width/2-width*r.x/100*r.scale,y:height/2-height*r.y/100*r.scale};}

export function refreshWorldNames(){for(const p of worldPlaces)p.name=displayName(p.entityId,p.defaultName);}
