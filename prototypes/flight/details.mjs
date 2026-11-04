// Only city landmarks are modelled; forests remain part of the cartographic terrain.
export function buildDetails(sample,height,cities){
 const vertices=[];let trees=0;
 const add=(p,n,c)=>vertices.push(...p,...n,...c);
 function tri(a,b,c,color){const u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;for(const p of [a,b,c])add(p,n.map(v=>v/l),color);}
 function box(x,y,z,w,d,h,color){const p=[[x-w/2,y-d/2,z],[x+w/2,y-d/2,z],[x+w/2,y+d/2,z],[x-w/2,y+d/2,z],[x-w/2,y-d/2,z+h],[x+w/2,y-d/2,z+h],[x+w/2,y+d/2,z+h],[x-w/2,y+d/2,z+h]];for(const [a,b,c,d]of [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]]){tri(p[a],p[b],p[c],color);tri(p[a],p[c],p[d],color);}}
 function cone(x,y,z,r,h,color,sides=6){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides;tri([x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],[x,y,z+h],color);}}
 const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
 const treeCount=vertices.length/9;
 for(const [kind,u,v]of cities){const x=(u-.5)*16,y=(v-.5)*9,z=height(u,v),stone=[.48,.46,.36],roof=[.30,.12,.075],size=kind==='capital'?.10:.065;
  if(kind==='capital'&&u<.4){aurenthar(x,y,z);continue;}
  if(kind==='village'){for(let j=0;j<9;j++){const px=x+(hash(j,u)-.5)*.20,py=y+(hash(j,v)-.5)*.14;box(px,py,z,.028,.034,.025,[.62,.53,.36]);cone(px,py,z+.025,.025,.022,roof,4);}continue;}
  box(x,y,z,size*1.25,size,.075,stone);box(x,y,z+.075,size*.72,size*.6,.065,[.56,.53,.43]);cone(x,y,z+.14,size*.6,.07,roof,4);
  for(const dx of [-1,1])for(const dy of [-1,1]){const px=x+dx*size*.66,py=y+dy*size*.52;box(px,py,z,size*.24,size*.24,.115,stone);cone(px,py,z+.115,size*.20,.05,roof,6);}
  if(kind==='capital'){box(x,y,z+.14,.025,.025,.10,stone);cone(x,y,z+.24,.03,.05,roof,6);}
 }
 function cylinder(x,y,z,r,h,color,sides=20){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides,p=[x+Math.cos(a)*r,y+Math.sin(a)*r,z],q=[x+Math.cos(b)*r,y+Math.sin(b)*r,z],pt=[p[0],p[1],z+h],qt=[q[0],q[1],z+h];tri(p,q,qt,color);tri(p,qt,pt,color);tri([x,y,z+h],pt,qt,color);}}
 function ring(x,y,z,outer,inner,h,color,sides=24){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides,p=[x+Math.cos(a)*outer,y+Math.sin(a)*outer,z+h],q=[x+Math.cos(b)*outer,y+Math.sin(b)*outer,z+h],r=[x+Math.cos(a)*inner,y+Math.sin(a)*inner,z+h],s=[x+Math.cos(b)*inner,y+Math.sin(b)*inner,z+h];tri(p,q,r,color);tri(q,s,r,color);tri([p[0],p[1],z],[q[0],q[1],z],q,color);tri([p[0],p[1],z],q,p,color);}}
 function aurenthar(x,y,z){
  const limestone=[.70,.68,.57],trim=[.83,.79,.66],base=[.35,.38,.34],roof=[.48,.22,.13],dark=[.075,.10,.10],gold=[.65,.47,.20];
  function hipRoof(cx,cy,z,w,d,h){const a=[cx-w/2,cy-d/2,z],b=[cx+w/2,cy-d/2,z],c=[cx+w/2,cy+d/2,z],e=[cx-w/2,cy+d/2,z],p=[cx-w*.23,cy,z+h],q=[cx+w*.23,cy,z+h];tri(a,b,q,roof);tri(a,q,p,roof);tri(b,c,q,roof);tri(c,e,p,roof);tri(c,p,q,roof);tri(e,a,p,roof);}
  // A substantial silhouette and layered architecture, rather than a marker-sized box.
  cylinder(x,y,z,.36,.025,base,40);cylinder(x,y,z+.025,.31,.025,[.48,.48,.40],32);z+=.05;
  box(x,y-.02,z,.44,.33,.045,[.45,.47,.40]);
  for(const side of [-1,1]){box(x+side*.205,y-.005,z,.025,.34,.145,limestone);for(let j=0;j<9;j++)box(x+side*.205,y-.15+j*.037,z+.145,.033,.019,.025,trim);}
  box(x,y-.16,z,.43,.025,.145,limestone);for(let j=0;j<12;j++)box(x-.205+j*.037,y-.16,z+.145,.019,.033,.025,trim);
  for(const side of [-1,1]){box(x+side*.145,y+.16,z,.14,.028,.15,limestone);for(let j=0;j<4;j++)box(x+side*.145-.05+j*.033,y+.16,z+.15,.018,.034,.025,trim);}
  function tower(tx,ty,h,r=.045,spire=false){cylinder(tx,ty,z,r*1.17,.018,trim,18);cylinder(tx,ty,z+.018,r,h,limestone,18);ring(tx,ty,z+h,r*1.14,r*.72,.018,trim,20);for(let j=0;j<10;j++){const a=j*Math.PI/5;box(tx+Math.cos(a)*r,ty+Math.sin(a)*r,z+h+.018,.014,.014,.026,trim);}for(const dz of [.075,.15]){if(dz>h-.03)continue;box(tx,ty+r+.001,z+dz,.010,.003,.029,dark);box(tx+r+.001,ty,z+dz,.003,.010,.029,dark);}if(spire){cone(tx,ty,z+h+.012,r*.9,.12,roof,18);cylinder(tx,ty,z+h+.13,.004,.025,gold,8);}}
  for(const sx of [-1,1])for(const sy of [-1,1])tower(x+sx*.205,y+sy*.16,.205,.045);
  box(x,y+.16,z,.115,.07,.17,limestone);box(x,y+.198,z,.053,.003,.09,dark);cone(x,y+.20,z+.09,.026,.025,trim,16);box(x,y+.224,z+.009,.066,.06,.012,[.34,.25,.16]);
  for(let i=0;i<5;i++)box(x,y+.25+i*.02,z-.004-i*.008,.07,.023,.012,trim);
  // Great hall with facade pilasters and individually inset windows.
  box(x,y-.035,z,.19,.16,.225,limestone);box(x,y-.035,z+.205,.21,.18,.025,trim);hipRoof(x,y-.035,z+.23,.23,.20,.10);
  for(const sx of [-1,1])for(let j=0;j<3;j++)box(x+sx*.098,y-.093+j*.06,z,.012,.016,.22,trim);
  for(let row=0;row<2;row++)for(let col=0;col<3;col++)box(x-.055+col*.055,y+.046,z+.07+row*.075,.018,.003,.036,dark);
  box(x,y-.07,z+.225,.095,.09,.18,limestone);box(x,y-.07,z+.405,.11,.11,.02,trim);hipRoof(x,y-.07,z+.425,.13,.13,.13);
  tower(x-.092,y-.105,.33,.031,true);tower(x+.092,y-.105,.33,.031,true);
  box(x,y-.07,z+.555,.005,.005,.075,gold);box(x+.029,y-.07,z+.599,.058,.002,.029,[.45,.08,.08]);
  for(let j=0;j<3;j++)box(x-.028+j*.028,y-.024,z+.29,.011,.003,.035,dark);
 }
 return {vertices:new Float32Array(vertices),treeCount,totalCount:vertices.length/9,trees};
}

export class DetailRenderer{
 constructor(gl,projection){this.gl=gl;const vert=`#version 300 es
 precision highp float;in vec3 position;in vec3 normal;in vec3 tint;uniform vec2 center;uniform float distance;uniform float tilt;uniform float aspect;uniform float focal;out vec3 color;out vec3 world;out float depth;
 void main(){world=position;vec3 p=position-vec3(center,0.);float s=sin(tilt),c=cos(tilt);depth=distance-p.y*s-p.z*c;gl_Position=vec4(p.x*focal/aspect,(-p.y*c+p.z*s)*focal,(100.05/99.95)*depth-.10005,depth);float light=max(0.,dot(normal,normalize(vec3(-.5,-.8,1.6))));color=tint*(.55+.6*light);}`;
 const frag=`#version 300 es
 precision highp float;in vec3 color;in vec3 world;in float depth;uniform float opacity;uniform float distance;out vec4 result;void main(){float haze=smoothstep(.8,2.6,depth/distance)*.12;float grain=fract(sin(dot(floor(world*500.),vec3(12.9,78.2,37.7)))*43758.5);float stone=step(color.r*.72,color.g)*step(.10,color.r);float course=step(.94,fract(world.z*74.));float brick=step(.96,fract(world.x*58.+floor(world.z*74.)*.5));float wear=1.-stone*(course*.10+brick*.035)+(grain-.5)*.045;result=vec4(mix(color*wear,vec3(.23,.38,.39),haze),opacity);}`;
 const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};this.program=gl.createProgram();gl.attachShader(this.program,compile(gl.VERTEX_SHADER,vert));gl.attachShader(this.program,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));this.u=Object.fromEntries(['center','distance','tilt','aspect','focal','opacity'].map(k=>[k,gl.getUniformLocation(this.program,k)]));this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);for(const[name,offset]of[['position',0],['normal',12],['tint',24]]){const a=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,offset);}this.projection=projection;}
 setSource(mesh){const gl=this.gl;gl.bindVertexArray(this.vao);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);this.mesh=mesh;}
 draw(camera){if(!this.mesh)return;const alpha=Math.max(0,Math.min(1,(camera.zoom-2.1)/1.2));if(alpha===0)return;const gl=this.gl,d=this.projection();gl.useProgram(this.program);gl.bindVertexArray(this.vao);gl.uniform2f(this.u.center,camera.x,camera.y);for(const k of ['distance','tilt','aspect'])gl.uniform1f(this.u[k],d[k]);gl.uniform1f(this.u.focal,d.focal);gl.uniform1f(this.u.opacity,alpha);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(alpha>.99);gl.drawArrays(gl.TRIANGLES,0,this.mesh.totalCount);gl.depthMask(true);gl.disable(gl.BLEND);}
}
