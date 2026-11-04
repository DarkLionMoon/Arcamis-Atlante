import test from 'node:test';
import assert from 'node:assert/strict';
import {coverDistance,groundOffsets,constrainMapCamera} from '../dist/map-camera.mjs';
const focal=1/Math.tan(20*Math.PI/180);
test('the overview fills wide and portrait viewports without external borders',()=>{
 for(const[width,height]of[[1876,958],[1280,720],[390,844],[2560,1080]]){const distance=coverDistance(width,height,16,9,focal),o=groundOffsets(width,height,distance,0,focal);assert.ok(o.maxX-o.minX<=16);assert.ok(o.maxY-o.minY<=9);assert.ok(Math.max((o.maxX-o.minX)/16,(o.maxY-o.minY)/9)>.98);}
});
test('camera limits keep every projected corner inside the map while zooming and panning',()=>{
 for(const[width,height]of[[1876,958],[1280,720],[390,844],[2560,1080]])for(const zoom of[1,1.5,2,2.65,3,4,6]){const t=Math.min(1,Math.max(0,(zoom-1.05)/2.45)),tilt=t*t*(3-2*t)*52*Math.PI/180,distance=coverDistance(width,height,16,9,focal)/zoom;for(const x of[-100,0,100])for(const y of[-100,0,100]){const c=constrainMapCamera({x,y,zoom},width,height,distance,tilt,focal),o=groundOffsets(width,height,distance,tilt,focal);assert.ok(c.x+o.minX>=-8-1e-8);assert.ok(c.x+o.maxX<=8+1e-8);assert.ok(c.y+o.minY>=-4.5-1e-8);assert.ok(c.y+o.maxY<=4.5+1e-8);}}
});
