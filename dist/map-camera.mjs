export function coverDistance(width,height,mapWidth,mapHeight,focal){return Math.min(mapHeight,mapWidth/(width/height))*focal*.495;}
export function groundOffsets(width,height,distance,tilt,focal){
 const aspect=width/height,s=Math.sin(tilt),c=Math.cos(tilt),points=[];
 for(const nx of[-aspect/focal,aspect/focal])for(const ny of[-1/focal,1/focal]){const t=distance*c/(c-ny*s);points.push({x:nx*t,y:distance*s+(-ny*c-s)*t});}
 return{minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),minY:Math.min(...points.map(p=>p.y)),maxY:Math.max(...points.map(p=>p.y))};
}
export function constrainMapCamera(camera,width,height,distance,tilt,focal,mapWidth=16,mapHeight=9){
 const o=groundOffsets(width,height,distance,tilt,focal),bound=(value,min,max)=>min>max?(min+max)/2:Math.max(min,Math.min(max,value));
 // Keep the overview edge-to-edge, then allow the camera centre to reach map-edge locations.
 const t=Math.max(0,Math.min(1,(camera.zoom-1)/1.25)),freedom=t*t*(3-2*t),mix=(a,b)=>a+(b-a)*freedom;
 return{...camera,x:bound(camera.x,mix(-mapWidth/2-o.minX,-mapWidth/2),mix(mapWidth/2-o.maxX,mapWidth/2)),y:bound(camera.y,mix(-mapHeight/2-o.minY,-mapHeight/2),mix(mapHeight/2-o.maxY,mapHeight/2))};
}
