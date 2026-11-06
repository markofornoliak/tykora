import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';

const [variant,sourceDir]=process.argv.slice(2);
const routes=['home','academy','practice','analytics','profile'];
const output='performance-artifacts/iter6-route-js/'+variant;
const shaMap={
  main:'0a7d167bc320b503a03dfe1247c96687526ca28b',
  iter5:'244c5060b37ba9d802dbad796b3ce1ed562f5339',
  iter6:process.env.GITHUB_SHA??'unknown'
};
if(!shaMap[variant]||!sourceDir)throw Error('Expected variant and sourceDir');
mkdirSync(output,{recursive:true});
const files=[];
function walk(folder,prefix=''){
 for(const item of readdirSync(folder,{withFileTypes:true})){
  const rel=prefix?prefix+'/'+item.name:item.name;
  if(item.isDirectory())walk(join(folder,item.name),rel);
  else files.push(rel);
 }
}
walk(join(sourceDir,'dist'));
const size=Object.fromEntries(files.filter(f=>f.endsWith('.js')).map(f=>[f,gzipSync(readFileSync(join(sourceDir,'dist',f))).byteLength]));
const browser=await chromium.launch({headless:true});
try{
 const result={variant,sha:shaMap[variant],n:5,browserVersion:browser.version(),scope:'Five fresh browser contexts per route, real production Vite preview, wait for actual main heading and networkidle, no service-worker mocks; gzipped disk bytes for every requested JS asset, not HTTP transfer bytes',routes:{}};
 for(const route of routes){
  const trials=[];
  for(let trial=1;trial<=5;trial++){
   const ctx=await browser.newContext({viewport:{width:412,height:823}});
   try{
    const page=await ctx.newPage();
    const captured=new Set();
    const external=[];
    page.on('request',req=>{
      if(!/^https?:/i.test(req.url()))return;
      const url=new URL(req.url());
      if(url.hostname!=='127.0.0.1'){external.push(req.url());return;}
      const path=decodeURIComponent(url.pathname).replace(/^\/+/, '');
      if(path.endsWith('.js'))captured.add(path);
    });
    const hash=route==='home'?'#/':'#/'+route;
    await page.goto('http://127.0.0.1:4174/'+hash,{waitUntil:'domcontentloaded'});
    await page.locator('main h1').first().waitFor({state:'visible',timeout:20000});
    await page.waitForLoadState('networkidle',{timeout:20000});
    await page.waitForTimeout(250);
    const heading=await page.locator('main h1').first().innerText();
    const missing=[...captured].filter(file=>!(file in size));
    if(missing.length)throw Error('Requested JS missing from built dist: '+missing.join(','));
    if(external.length)throw Error('Unexpected external network requests: '+external.join(','));
    // SW files are discovered if requested by page; this number is a cold-page
    // requested-JS closure, not a claim about future interaction/deep navigation.
    const requested=[...captured].sort();
    const gzipBytes=requested.reduce((sum,file)=>sum+size[file],0);
    trials.push({trial,gzipBytes,requested,heading});
   }finally{await ctx.close();}
  }
  const sorted=trials.map(x=>x.gzipBytes).sort((a,b)=>a-b);
  const stable=trials.every(x=>JSON.stringify(x.requested)===JSON.stringify(trials[0].requested));
  result.routes[route]={n:5,medianGzipBytes:sorted[2],minGzipBytes:sorted[0],maxGzipBytes:sorted[4],sameRequestsEveryTrial:stable,trials};
  console.log('ITER6_ROUTE_JS '+JSON.stringify({variant,route,sha:result.sha,n:5,median:sorted[2],range:[sorted[0],sorted[4]],stable,files:trials[0].requested}));
 }
 writeFileSync(join(output,'summary.json'),JSON.stringify(result,null,2));
}finally{await browser.close();}
