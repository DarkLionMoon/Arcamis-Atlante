// Prototype geometry: trees follow the existing canopy colours, never a new forest mask.
export function buildDetails(sample,height,cities){
 const vertices=[];let trees=0;
 const add=(p,n,c)=>vertices.push(...p,...n,...c);
 function tri(a,b,c,color){const u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;for(const p of [a,b,c])add(p,n.map(v=>v/l),color);}
 function box(x,y,z,w,d,h,color){const p=[[x-w/2,y-d/2,z],[x+w/2,y-d/2,z],[x+w/2,y+d/2,z],[x-w/2,y+d/2,z],[x-w/2,y-d/2,z+h],[x+w/2,y-d/2,z+h],[x+w/2,y+d/2,z+h],[x-w/2,y+d/2,z+h]];for(const [a,b,c,d]of [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]]){tri(p[a],p[b],p[c],color);tri(p[a],p[c],p[d],color);}}
 function cone(x,y,z,r,h,color,sides=6){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides;tri([x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],[x,y,z+h],color);}}
 const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
 for(let i=0;i<22000;i++){const u=hash(i,13),v=hash(i,37),[r,g,b]=sample(u,v);if(!(g>r*1.13&&g>b*1.35&&r<100&&g<145)||u<.025||u>.975||v<.035||v>.96)continue;const x=(u-.5)*16,y=(v-.5)*9,z=height(u,v);if(cities.some(c=>Math.hypot((u-c[1])*16,(v-c[2])*9)<.13))continue;const size=.018+hash(i,55)*.020,tone=hash(i,92);box(x,y,z,.007,.007,size*.7,[.21,.16,.08]);cone(x,y,z+size*.3,size*.6,size*1.5,[.12+tone*.04,.24+tone*.11,.09+tone*.025],7);cone(x,y,z+size*.85,size*.42,size,[.15+tone*.06,.29+tone*.10,.10+tone*.03],7);trees++;}
 const treeCount=vertices.length/9;
 for(const [kind,u,v]of cities){const x=(u-.5)*16,y=(v-.5)*9,z=height(u,v),stone=[.48,.46,.36],roof=[.30,.12,.075],size=kind==='capital'?.10:.065;
  if(kind==='village'){for(let j=0;j<9;j++){const px=x+(hash(j,u)-.5)*.20,py=y+(hash(j,v)-.5)*.14;box(px,py,z,.028,.034,.025,[.62,.53,.36]);cone(px,py,z+.025,.025,.022,roof,4);}continue;}
  box(x,y,z,size*1.25,size,.075,stone);box(x,y,z+.075,size*.72,size*.6,.065,[.56,.53,.43]);cone(x,y,z+.14,size*.6,.07,roof,4);
  for(const dx of [-1,1])for(const dy of [-1,1]){const px=x+dx*size*.66,py=y+dy*size*.52;box(px,py,z,size*.24,size*.24,.115,stone);cone(px,py,z+.115,size*.20,.05,roof,6);}
  if(kind==='capital'){box(x,y,z+.14,.025,.025,.10,stone);cone(x,y,z+.24,.03,.05,roof,6);}
 }
 return {vertices:new Float32Array(vertices),treeCount,totalCount:vertices.length/9,trees};
}

export class DetailRenderer{
 constructor(gl,projection){this.gl=gl;const vert=`#version 300 es
 precision highp float;in vec3 position;in vec3 normal;in vec3 tint;uniform vec2 center;uniform float distance;uniform float tilt;uniform float aspect;uniform float focal;out vec3 color;out float depth;
 void main(){vec3 p=position-vec3(center,0.);float s=sin(tilt),c=cos(tilt);depth=distance-p.y*s-p.z*c;gl_Position=vec4(p.x*focal/aspect,(-p.y*c+p.z*s)*focal,(100.05/99.95)*depth-.10005,depth);float light=max(0.,dot(normal,normalize(vec3(-.5,-.8,1.6))));color=tint*(.55+.6*light);}`;
 const frag=`#version 300 es
 precision highp float;in vec3 color;in float depth;uniform float opacity;uniform float distance;out vec4 result;void main(){float haze=smoothstep(.8,2.6,depth/distance)*.12;result=vec4(mix(color,vec3(.23,.38,.39),haze),opacity);}`;
 const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};this.program=gl.createProgram();gl.attachShader(this.program,compile(gl.VERTEX_SHADER,vert));gl.attachShader(this.program,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));this.u=Object.fromEntries(['center','distance','tilt','aspect','focal','opacity'].map(k=>[k,gl.getUniformLocation(this.program,k)]));this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);for(const[name,offset]of[['position',0],['normal',12],['tint',24]]){const a=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,offset);}this.projection=projection;}
 setSource(mesh){const gl=this.gl;gl.bindVertexArray(this.vao);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);this.mesh=mesh;}
 draw(camera){if(!this.mesh)return;const alpha=Math.max(0,Math.min(1,(camera.zoom-2.1)/1.2));if(alpha===0)return;const gl=this.gl,d=this.projection();gl.useProgram(this.program);gl.bindVertexArray(this.vao);gl.uniform2f(this.u.center,camera.x,camera.y);for(const k of ['distance','tilt','aspect'])gl.uniform1f(this.u[k],d[k]);gl.uniform1f(this.u.focal,d.focal);gl.uniform1f(this.u.opacity,alpha);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(alpha>.99);gl.drawArrays(gl.TRIANGLES,0,this.mesh.totalCount);gl.depthMask(true);gl.disable(gl.BLEND);}
}
