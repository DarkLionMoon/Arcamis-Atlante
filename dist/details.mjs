// Only city landmarks are modelled; forests remain part of the cartographic terrain.
export function buildDetails(sample,height,cities){
 const vertices=[];let trees=0;
 const add=(p,n,c)=>vertices.push(...p,...n,...c);
 function tri(a,b,c,color){const u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;for(const p of [a,b,c])add(p,n.map(v=>v/l),color);}
 function box(x,y,z,w,d,h,color){const p=[[x-w/2,y-d/2,z],[x+w/2,y-d/2,z],[x+w/2,y+d/2,z],[x-w/2,y+d/2,z],[x-w/2,y-d/2,z+h],[x+w/2,y-d/2,z+h],[x+w/2,y+d/2,z+h],[x-w/2,y+d/2,z+h]];for(const [a,b,c,d]of [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]]){tri(p[a],p[b],p[c],color);tri(p[a],p[c],p[d],color);}}
 function cone(x,y,z,r,h,color,sides=6){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides;tri([x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],[x,y,z+h],color);}}
 const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
 const treeCount=vertices.length/9;
 const ranges=[];
 for(const record of cities){const {kind,u,v,scale=1,name=''}=Array.isArray(record)?{kind:record[0],u:record[1],v:record[2]}:record;const x=(u-.5)*16,y=(v-.5)*9,z=height(u,v),first=vertices.length;
  if(kind==='capital')aurenthar(x,y,z);
  else if(kind==='harbor')harbor(x,y,z);
  else if(kind==='fortress'||kind==='fort')fortress(x,y,z);
  else if(kind==='manor')manor(x,y,z);
  else if(kind==='watchtower')watchtower(x,y,z,.075,.40,true);
  else if(kind==='windmill')windmill(x,y,z);
  else village(x,y,z,kind);
  for(let i=first;i<vertices.length;i+=9){vertices[i]=x+(vertices[i]-x)*scale;vertices[i+1]=y+(vertices[i+1]-y)*scale;vertices[i+2]=z+(vertices[i+2]-z)*scale;}
  ranges.push({name,kind,start:first/9,count:(vertices.length-first)/9});
 }
 function cylinder(x,y,z,r,h,color,sides=20){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides,p=[x+Math.cos(a)*r,y+Math.sin(a)*r,z],q=[x+Math.cos(b)*r,y+Math.sin(b)*r,z],pt=[p[0],p[1],z+h],qt=[q[0],q[1],z+h];tri(p,q,qt,color);tri(p,qt,pt,color);tri([x,y,z+h],pt,qt,color);}}
 function ring(x,y,z,outer,inner,h,color,sides=24){for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides,p=[x+Math.cos(a)*outer,y+Math.sin(a)*outer,z+h],q=[x+Math.cos(b)*outer,y+Math.sin(b)*outer,z+h],r=[x+Math.cos(a)*inner,y+Math.sin(a)*inner,z+h],s=[x+Math.cos(b)*inner,y+Math.sin(b)*inner,z+h];tri(p,q,r,color);tri(q,s,r,color);tri([p[0],p[1],z],[q[0],q[1],z],q,color);tri([p[0],p[1],z],q,p,color);}}
 function gable(x,y,z,w,d,h,color=[.42,.20,.12]){const a=[x-w/2,y-d/2,z],b=[x+w/2,y-d/2,z],c=[x+w/2,y+d/2,z],e=[x-w/2,y+d/2,z],p=[x,y-d/2,z+h],q=[x,y+d/2,z+h];tri(a,b,p,color);tri(c,e,q,color);tri(a,p,q,color);tri(a,q,e,color);tri(b,c,q,color);tri(b,q,p,color);}
 function house(x,y,z,w=.075,d=.085,h=.065,roof=[.42,.20,.12]){const plaster=[.65,.60,.47],wood=[.25,.19,.12];box(x,y,z,w,d,h,plaster);gable(x,y,z+h,w*1.14,d*1.10,h*.65,roof);box(x,y+d/2+.001,z,.015,.003,h*.65,wood);for(const dx of [-.29,.29])box(x+dx*w,y+d/2+.002,z+h*.63,w*.12,.003,h*.20,[.12,.17,.17]);box(x+w*.26,y-d*.15,z+h*.90,.010,.013,h*.56,[.47,.40,.30]);}
 function watchtower(x,y,z,r=.055,h=.28,roof=false){const stone=[.59,.61,.56],trim=[.77,.75,.65];cylinder(x,y,z,r*1.25,.025,[.37,.40,.38],24);cylinder(x,y,z+.025,r,h,stone,24);for(const dz of [.06,h*.5,h*.87])ring(x,y,z+dz,r*1.04,r*.94,.012,trim);ring(x,y,z+h,r*1.18,r*.78,.025,trim,24);for(let j=0;j<12;j++){const a=j*Math.PI/6;box(x+Math.cos(a)*r*1.02,y+Math.sin(a)*r*1.02,z+h+.025,.016,.016,.032,trim);}for(const dz of [.10,.20,.30])if(dz<h-.03){box(x,y+r+.001,z+dz,.012,.003,.035,[.10,.15,.15]);box(x+r+.001,y,z+dz,.003,.012,.035,[.10,.15,.15]);}box(x,y+r+.002,z,.025,.003,.06,[.16,.14,.10]);if(roof)cone(x,y,z+h+.01,r*.89,.09,[.28,.34,.29],24);}
 function fortress(x,y,z){const stone=[.53,.55,.48],trim=[.72,.70,.60];box(x,y,z,.44,.31,.025,[.33,.36,.32]);for(const dx of [-.185,.185])box(x+dx,y,z,.033,.27,.14,stone);box(x,y-.12,z,.38,.032,.14,stone);for(const dx of [-.13,.13])box(x+dx,y+.12,z,.12,.035,.14,stone);for(const dx of [-.185,.185])for(const dy of [-.12,.12])watchtower(x+dx,y+dy,z,.038,.20);for(let j=0;j<10;j++)box(x-.17+j*.038,y-.12,z+.14,.02,.04,.025,trim);house(x,y-.025,z,.15,.13,.22,[.39,.20,.12]);box(x,y+.12,z,.11,.07,.18,stone);box(x,y+.157,z,.045,.003,.085,[.10,.14,.14]);box(x,y+.165,z+.005,.058,.10,.015,[.43,.33,.21]);}
 function manor(x,y,z){const stone=[.67,.64,.52];box(x,y,z,.43,.32,.025,[.40,.42,.34]);house(x,y-.025,z+.025,.21,.15,.17,[.48,.23,.13]);for(const dx of [-.15,.15]){house(x+dx,y+.035,z+.025,.075,.13,.10);watchtower(x+dx,y-.075,z,.036,.24,true);}box(x,y+.14,z,.35,.024,.065,stone);for(let j=0;j<11;j++)box(x-.16+j*.032,y+.14,z+.065,.018,.03,.018,[.78,.73,.60]);box(x,y+.154,z,.035,.003,.06,[.12,.15,.13]);}
 function harbor(x,y,z){const pale=[.66,.69,.63],blue=[.19,.31,.32];cylinder(x,y,z,.29,.025,[.36,.41,.38],32);house(x-.055,y-.02,z+.025,.20,.16,.16,blue);watchtower(x+.115,y-.08,z+.025,.072,.39,true);watchtower(x-.17,y-.08,z+.025,.042,.23);box(x,y+.125,z,.36,.035,.10,pale);for(const dx of [-.14,-.07,0,.07,.14]){box(x+dx,y+.148,z+.025,.025,.003,.055,[.16,.22,.23]);box(x+dx,y+.11,z+.10,.02,.05,.017,[.80,.79,.66]);}box(x,y+.19,z,.15,.14,.018,[.33,.26,.17]);for(const dx of [-.064,.064])for(const dy of [.14,.23])cylinder(x+dx,y+dy,z-.035,.007,.065,[.30,.23,.14],8);}
 function village(x,y,z,kind){const roof=kind==='village'?[.31,.32,.27]:[.48,.22,.12];cylinder(x,y,z,.24,.008,[.45,.43,.32],28);const positions=[[-.14,-.045],[-.06,-.10],[.045,-.09],[.14,-.03],[-.13,.065],[.095,.065]];for(const [dx,dy]of positions)house(x+dx,y+dy,z+.008,.065,.075,.05,roof);house(x,y+.015,z+.008,kind==='port'?.12:.10,.09,.095,roof);if(kind==='market'){for(const dx of [-.06,.025]){for(const sx of [-1,1])for(const sy of [-1,1])box(x+dx+sx*.03,y+.14+sy*.023,z,.006,.006,.048,[.34,.26,.15]);gable(x+dx,y+.14,z+.048,.072,.058,.018,[.68,.53,.30]);}}if(kind==='port'){watchtower(x-.18,y-.09,z,.028,.16);box(x,y+.18,z,.12,.17,.012,[.34,.25,.15]);for(let i=0;i<8;i++)box(x,y+.11+i*.02,z+.012,.13,.003,.003,[.54,.40,.22]);}}
 function windmill(x,y,z){cylinder(x,y,z,.15,.008,[.44,.44,.32],24);cylinder(x,y,z+.008,.055,.20,[.68,.64,.51],16);cone(x,y,z+.208,.070,.085,[.39,.20,.12],16);const front=y+.09,cz=z+.17;for(let j=0;j<4;j++){const a=Math.PI*.25+j*Math.PI*.5,dx=Math.cos(a),dz=Math.sin(a),px=-dz*.024,pz=dx*.024,A=[x+dx*.025+px,front,cz+dz*.025+pz],B=[x+dx*.21+px,front,cz+dz*.21+pz],C=[x+dx*.21-px,front,cz+dz*.21-pz],D=[x+dx*.025-px,front,cz+dz*.025-pz];tri(A,B,C,[.86,.79,.59]);tri(A,C,D,[.86,.79,.59]);}box(x,y+.056,z,.02,.003,.05,[.18,.17,.12]);house(x+.115,y-.025,z,.08,.09,.06);}
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
 return {vertices:new Float32Array(vertices),treeCount,totalCount:vertices.length/9,trees,ranges};
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
