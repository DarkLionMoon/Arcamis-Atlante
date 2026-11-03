import {buildTerrainMesh} from './terrain.mjs';
const vertex=`#version 300 es
precision highp float;
in vec3 a_position;in vec3 a_normal;
uniform vec2 u_resolution;uniform vec2 u_size;uniform vec2 u_origin;uniform float u_relief;
out vec2 v_uv;out vec3 v_normal;out float v_height;
void main(){v_uv=a_position.xy;v_normal=a_normal;v_height=a_position.z;vec2 pixel=u_origin+a_position.xy*u_size;pixel.y-=a_position.z*u_size.y*.065*u_relief;vec2 clip=pixel/u_resolution*2.-1.;gl_Position=vec4(clip.x,-clip.y,-a_position.z*.5,1.);}`;
const fragment=`#version 300 es
precision highp float;
uniform sampler2D u_map;uniform float u_relief;uniform float u_zoom;
in vec2 v_uv;in vec3 v_normal;in float v_height;out vec4 color;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){vec4 original=texture(u_map,v_uv);float light=max(0.,dot(normalize(v_normal),normalize(vec3(-.55,.6,1.1))));float shade=.88+.20*light;float terrainDetail=(noise(v_uv*vec2(3300.,1900.))-.5)*.025*smoothstep(1.2,2.8,u_zoom)*smoothstep(.02,.3,v_height);color=vec4(original.rgb*mix(1.,shade,u_relief)+terrainDetail,original.a);}`;
export class ReliefRenderer{
 constructor(viewport,onFallback){
  this.viewport=viewport;this.onFallback=onFallback;this.enabled=true;this.ready=false;this.last=null;
  this.canvas=document.createElement('canvas');this.canvas.id='relief-canvas';this.canvas.setAttribute('aria-hidden','true');this.canvas.className='relief-canvas';viewport.prepend(this.canvas);
  this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.ready=false;this.onFallback();});
  this.canvas.addEventListener('webglcontextrestored',()=>{try{this.setup();if(this.source)this.setSource(this.source,this.sheet);}catch{this.onFallback();}});
  try{this.setup();}catch{this.gl=null;this.canvas.remove();}
 }
 setup(){const gl=this.gl=this.canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:false});if(!gl)throw Error('WebGL2 unavailable');
  const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(msg);}return s;};
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));this.program=program;
  this.uniforms=Object.fromEntries(['resolution','size','origin','relief','zoom','map'].map(k=>[k,gl.getUniformLocation(program,'u_'+k)]));this.position=gl.getAttribLocation(program,'a_position');this.normal=gl.getAttribLocation(program,'a_normal');
  this.vertexBuffer=gl.createBuffer();this.indexBuffer=gl.createBuffer();this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
 }
 setSource(image,sheet='mondo'){
  if(!this.gl)return false;this.source=image;this.sheet=sheet;
  const gl=this.gl,sample=document.createElement('canvas');sample.width=320;sample.height=180;const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,320,180);const data=ctx.getImageData(0,0,320,180).data;
  const landAt=(x,y)=>{const i=(Math.min(179,Math.max(0,Math.round(y*179)))*320+Math.min(319,Math.max(0,Math.round(x*319))))*4,r=data[i],g=data[i+1],b=data[i+2];return g>r*1.12&&b>r*1.05?0:1;};this.landAt=landAt;
  const mesh=buildTerrainMesh(256,144,landAt,sheet);this.count=mesh.indices.length;gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.generateMipmap(gl.TEXTURE_2D);const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));this.ready=true;if(this.last)this.draw(...this.last);return true;
 }
 draw(view,sheet){this.last=[view,sheet];if(!this.ready||!this.enabled)return;const gl=this.gl,w=this.viewport.clientWidth,h=this.viewport.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(this.canvas.width!==Math.round(w*dpr)||this.canvas.height!==Math.round(h*dpr)){this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);}gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);gl.enableVertexAttribArray(this.position);gl.vertexAttribPointer(this.position,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(this.normal);gl.vertexAttribPointer(this.normal,3,gl.FLOAT,false,24,12);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(this.uniforms.map,0);gl.uniform2f(this.uniforms.resolution,w,h);gl.uniform2f(this.uniforms.size,sheet.width*view.scale,sheet.height*view.scale);gl.uniform2f(this.uniforms.origin,sheet.left+view.x,sheet.top+view.y);gl.uniform1f(this.uniforms.relief,Math.min(1,Math.max(.2,(view.scale-1)*.7)));gl.uniform1f(this.uniforms.zoom,view.scale);gl.drawElements(gl.TRIANGLES,this.count,gl.UNSIGNED_SHORT,0);}
 setEnabled(enabled){this.enabled=enabled;this.canvas.hidden=!enabled;if(enabled&&this.last)this.draw(...this.last);}
}
