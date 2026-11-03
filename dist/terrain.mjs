const gaussian=(x,y,cx,cy,rx,ry)=>Math.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2));
const ridge=(x,y,points)=>points.reduce((h,[cx,cy,rx,ry,strength])=>h+gaussian(x,y,cx,cy,rx,ry)*strength,0);
export function elevationAt(x,y,land=1,sheet='mondo'){
 if(land<=0)return 0;
 const ranges=sheet==='marchesato'?[[.36,.42,.055,.035,.19],[.45,.45,.055,.035,.16],[.82,.51,.03,.025,.19]]:[[.035,.06,.075,.09,.65],[.07,.14,.09,.10,.7],[.12,.23,.085,.08,.55],[.17,.30,.075,.07,.25],[.77,.10,.045,.05,.55],[.82,.16,.05,.07,.55],[.86,.20,.045,.05,.3]];
 const mountain=ridge(x,y,ranges);
 const crags=.7+.18*Math.sin(x*214+y*157)+.12*Math.sin(x*391-y*242);
 return Math.max(0,land*(.012+mountain*crags));
}
export function buildTerrainMesh(cols,rows,landAt=()=>1,sheet='mondo'){
 if((cols+1)*(rows+1)>65535)throw new RangeError('Terrain grid exceeds index capacity');
 const vertices=new Float32Array((cols+1)*(rows+1)*6),indices=new Uint16Array(cols*rows*6);
 const dx=1/cols,dy=1/rows;
 const height=(x,y)=>elevationAt(x,y,landAt(x,y),sheet);
 let n=0;for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
  const x=i/cols,y=j/rows,h=height(x,y),sx=(height(Math.min(1,x+dx),y)-height(Math.max(0,x-dx),y))/(2*dx)*.035,sy=(height(x,Math.min(1,y+dy))-height(x,Math.max(0,y-dy)))/(2*dy)*.065;
  const length=Math.hypot(sx,sy,1);vertices.set([x,y,h,-sx/length,sy/length,1/length],n);n+=6;
 }
 n=0;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;indices.set([a,c,b,b,c,d],n);n+=6;}
 return {vertices,indices};
}
