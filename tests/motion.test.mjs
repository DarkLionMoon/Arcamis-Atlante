import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approachView} from '../dist/motion.mjs';
test('camera moves toward its target without jumping or overshooting',()=>{
 const from={x:0,y:0,scale:1},to={x:-200,y:-100,scale:2};
 const next=approachView(from,to,16);
 assert.ok(next.scale>1&&next.scale<2);
 assert.ok(next.x<0&&next.x>-200);
 let actual=from;for(let i=0;i<150;i++)actual=approachView(actual,to,16);
 assert.deepEqual(actual,to);
});
test('camera interpolation is independent of refresh rate and safe after suspended tabs',()=>{
 const a={x:0,y:0,scale:1},b={x:-200,y:100,scale:4};
 const one=approachView(a,b,32),two=approachView(approachView(a,b,16),b,16);
 assert.ok(Math.abs(one.scale-two.scale)<1e-8);
 assert.equal(approachView(a,b,0).scale,1);
 assert.deepEqual(approachView(a,b,100000),b);
});
