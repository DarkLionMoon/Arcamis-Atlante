// Exact vector typography over the two label areas cleaned with ImageGen.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('@playwright/test');
(async()=>{
 const input=process.argv[2],svgPath=path.resolve('sources/marchesato-labels.svg');
 if(input){
  const png=fs.readFileSync(input),width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  const labels=[{text:'Forte Vigilus',x:.182,y:.304,angle:-4},{text:'Volonx',x:.946,y:.392,angle:0},{text:'Lago di Gromot',x:.908,y:.515,angle:-55,water:true}];
  const text=labels.map(p=>`<text x="${width*p.x}" y="${height*p.y}" transform="rotate(${p.angle} ${width*p.x} ${height*p.y})" ${p.water?`font-size="${height*.016}" fill="#193f40" stroke="#91b8b1" stroke-width=".7"`:``}>${p.text}</text>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="data:image/png;base64,${png.toString('base64')}"/><g text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${height*.023}" font-weight="600" fill="#f1dfa7" stroke="#292411" stroke-width="${height*.0031}" stroke-linejoin="round" paint-order="stroke fill">${text}</g></svg>`;
  fs.writeFileSync(svgPath,svg);
 }
 const svg=fs.readFileSync(svgPath,'utf8'),width=Number(svg.match(/width="(\d+)"/)[1]),height=Number(svg.match(/height="(\d+)"/)[1]);
 if(!['Forte Vigilus','Volonx','Lago di Gromot'].every(name=>svg.includes('>'+name+'</text>')))throw Error('Map label source does not contain the exact approved names');
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.setContent('<style>html,body{margin:0;padding:0;overflow:hidden}img{display:block}</style><img alt="Marchesato di Arcamis">');
 await page.locator('img').evaluate((img,url)=>{img.src=url;return img.decode();},'data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64'));
 await page.screenshot({path:path.resolve('dist/assets/marchesato.png')});
 await browser.close();console.log('Rendered exact labels: Forte Vigilus / Volonx / Lago di Gromot');
})().catch(e=>{console.error(e);process.exit(1)});
