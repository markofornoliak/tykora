import {readFileSync,writeFileSync,readdirSync,statSync,mkdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const [command,...args]=process.argv.slice(2);
const fail=(why)=>{throw new Error('ITER6_CONTROL: '+why);};
const sha256=x=>createHash('sha256').update(x).digest('hex');
function files(directory){
 const walk=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(x=>{
  const p=join(dir,x.name);return x.isDirectory()?walk(p):[relative(directory,p).replaceAll('\\','/')];
 });
 return walk(directory).sort();
}
function quantile(values,p){
 const a=[...values].sort((x,y)=>x-y);
 if(a.length!==10||!a.every(Number.isFinite))fail('Expected ten finite samples');
 const at=(a.length-1)*p,low=Math.floor(at);
 return a[low]+(a[Math.min(a.length-1,low+1)]-a[low])*(at-low);
}
const median=xs=>quantile(xs,0.5);
if(command==='stamp'){
 const [src,variant,sha]=args;const dir=join(src,'dist');
 const record={variant,sha,files:Object.fromEntries(files(dir).filter(x=>/(\.js|\.css|\.html)$/.test(x)).map(x=>[x,sha256(readFileSync(join(dir,x)))]))};
 if(!record.files['index.html'])fail('No built index.html');
 writeFileSync(join(dir,'iter6-source-attestation.json'),JSON.stringify(record,null,2));
 console.log('ITER6_ATTEST_BUILD '+JSON.stringify({variant,sha,fileCount:Object.keys(record.files).length,indexSha:record.files['index.html']}));
}else if(command==='verify'){
 const [src,variant,sha]=args,dir=join(src,'dist');
 const record=JSON.parse(readFileSync(join(dir,'iter6-source-attestation.json'),'utf8'));
 if(record.variant!==variant||record.sha!==sha)fail('Wrong variant or SHA in attestation');
 const base='http://127.0.0.1:4174/';
 const stamp=await fetch(base+'iter6-source-attestation.json',{cache:'no-store'});
 if(!stamp.ok||JSON.stringify(await stamp.json())!==JSON.stringify(record))fail('Served artifact stamp mismatch');
 for(const [file,hash] of Object.entries(record.files)){
  const response=await fetch(base+file,{cache:'no-store'});
  if(!response.ok)fail('Missing served build asset '+file);
  const served=sha256(Buffer.from(await response.arrayBuffer()));
  if(served!==hash)fail('Served bytes differ from '+variant+' dist asset '+file);
 }
 console.log('ITER6_ATTEST_SERVE '+JSON.stringify({variant,sha,files:Object.keys(record.files).length,allBytesMatch:true,indexSha:record.files['index.html']}));
}else if(command==='summary'){
 const [folder,variant,sha,route]=args;
 const requestedUrl='http://127.0.0.1:4174/'+(route==='bare'?'':route==='hash'?'#/':route==='home'?'#/home':'#/'+route);
 const values={lcp:[],tbt:[],cls:[],perf:[]};let config=null;const labels=[];
 for(let i=1;i<=10;i++){
  const j=JSON.parse(readFileSync(join(folder,'run-'+i+'.json'),'utf8'));
  if(j.requestedUrl!==requestedUrl)fail('Lighthouse requested URL mismatch '+requestedUrl+' observed '+j.requestedUrl);
  if(j.lighthouseVersion!=='12.8.2')fail('Different Lighthouse version');
  const cfg=j.configSettings;
  if(cfg?.screenEmulation?.width!==412||cfg?.screenEmulation?.height!==823||cfg?.throttling?.cpuSlowdownMultiplier!==4||cfg?.throttling?.rttMs!==150)fail('Different mobile profile');
  const sig=JSON.stringify([j.environment?.hostUserAgent,cfg?.screenEmulation,cfg?.throttling,cfg?.throttlingMethod]);
  if(config!==null&&config!==sig)fail('Browser or Lighthouse config drift');
  config=sig;
  for(const [key,audit] of [['lcp','largest-contentful-paint'],['tbt','total-blocking-time'],['cls','cumulative-layout-shift']]){
   const v=j.audits[audit]?.numericValue;
   if(!Number.isFinite(v))fail('Missing '+audit+' run '+i);
   values[key].push(v);
  }
  values.perf.push(100*j.categories.performance.score);
  const label=j.audits['largest-contentful-paint-element']?.details?.items?.filter(x=>x.type==='table')?.flatMap(x=>x.items??[])?.find(x=>x.node)?.node?.nodeLabel??null;
  labels.push(label);
  if(['bare','hash','home'].includes(route)&&label!=='Каждое нажатие — шаг вперёд.')fail('LCP is not real Home H1 in '+variant+' '+route+' run '+i+': '+label);
 }
 const stats=x=>({p50:median(x),p90:quantile(x,.9),max:Math.max(...x),min:Math.min(...x)});
 const report={variant,sha,route,requestedUrl,n:10,LCP:stats(values.lcp),TBT:stats(values.tbt),CLS:stats(values.cls),performance:stats(values.perf),realLcpLabels:[...new Set(labels)],browserProfile:JSON.parse(config),raw:values};
 mkdirSync(folder,{recursive:true});writeFileSync(join(folder,'summary.json'),JSON.stringify(report,null,2));
 console.log('ITER6_CONTROLLED_LH '+JSON.stringify({variant,sha,route,n:10,lcp:report.LCP,tbt:report.TBT,cls:report.CLS,labels:report.realLcpLabels}));
}else if(command==='js'){
 const [src,variant,sha,outDir]=args;
 const {chromium}=await import('@playwright/test');const browser=await chromium.launch({headless:true});
 const dir=join(src,'dist'),gz=Object.fromEntries(files(dir).filter(x=>x.endsWith('.js')).map(x=>[x,gzipSync(readFileSync(join(dir,x))).length]));
 const report={variant,sha,scope:'Gzipped requested on-disk JS after real route heading, networkidle and 250ms; ten new browser contexts per route',routes:{}};
 try{
 for(const route of ['home','academy','practice','analytics','profile']){
  const trials=[];
  for(let i=0;i<10;i++){
   const context=await browser.newContext({viewport:{width:412,height:823}});
   try{
    const page=await context.newPage(),requests=new Set();
    page.on('request',req=>{
     if(req.url().startsWith('http://127.0.0.1:4174/')&&new URL(req.url()).pathname.endsWith('.js'))
       requests.add(decodeURIComponent(new URL(req.url()).pathname.replace(/^\/+/,'')));
    });
    await page.goto('http://127.0.0.1:4174/'+(route==='home'?'#/':'#/'+route),{waitUntil:'domcontentloaded'});
    await page.locator('main h1').first().waitFor({state:'visible',timeout:20000});
    await page.waitForLoadState('networkidle',{timeout:20000});await page.waitForTimeout(250);
    const needed=[...requests].sort(),missing=needed.filter(x=>gz[x]===undefined);
    if(missing.length)fail('JS not in this build: '+JSON.stringify(missing));
    trials.push({trial:i+1,gzipBytes:needed.reduce((sum,x)=>sum+gz[x],0),files:needed});
   }finally{await context.close();}
  }
  const items=trials.map(x=>x.gzipBytes);report.routes[route]={n:10,bytes:stats10(items),stable:trials.every(x=>JSON.stringify(x.files)===JSON.stringify(trials[0].files)),trials};
  console.log('ITER6_CONTROLLED_JS '+JSON.stringify({variant,sha,route,n:10,jsGzip:report.routes[route].bytes,files:trials[0].files}));
 }
 }finally{await browser.close();}
 mkdirSync(outDir,{recursive:true});writeFileSync(join(outDir,'js.json'),JSON.stringify(report,null,2));
}else fail('Unknown command '+command);
function stats10(x){return {p50:median(x),p90:quantile(x,.9),max:Math.max(...x),min:Math.min(...x)};}
