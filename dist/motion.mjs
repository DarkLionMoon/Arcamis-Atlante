export function approachView(from,to,elapsed){
 const alpha=1-Math.exp(-Math.max(0,elapsed)/65);
 const next=Object.fromEntries(['x','y','scale'].map(k=>[k,from[k]+(to[k]-from[k])*alpha]));
 if(Math.abs(next.x-to.x)<.02&&Math.abs(next.y-to.y)<.02&&Math.abs(next.scale-to.scale)<.0001)return {...to};
 return next;
}
