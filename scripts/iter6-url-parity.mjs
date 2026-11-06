import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
const root='performance-artifacts/iter6-url-parity';
const routes={bare:'http://127.0.0.1:4174/',hash:'http://127.0.0.1:4174/#/',home:'http://127.0.0.1:4174/#/home'};
const assert=(v,msg)=>{if(!v)throw new Error(msg);};
const median=x=>{const a=[...x].sort((u,v)=>u-v);assert(a.length===10,'Expected N=10');return (a[4]+a[5])/2;};
const chunkFiles=readdirSync('dist/assets').filter(f=>f.endsWith('.js'));
const gzip=Object.fromEntries(chunkFiles.map(f=>[f,gzipSync(readFileSync('dist/assets/'+f)).length]));
const boot=chunkFiles.filter(f=>f.startsWith('bootstrap-')), entry=chunkFiles.filter(f=>f.startsWith('index-'));
assert(boot.length===1&&entry.length===1,'Unexpected interactive JS chunk graph');
const sw=readdirSync('dist').includes('registerSW.js')?gzipSync(readFileSync('dist/registerSW.js')).length:0;
const interactiveGzip=gzip[boot[0]]+gzip[entry[0]]+sw;
let config=null;const summary={sha:process.env.GITHUB_SHA,interactiveJsGzipBytes:interactiveGzip,fullBundles:[boot[0],entry[0]],routes:{}};
for(const [slug,url] of Object.entries(routes)){
 const dir=join(root,slug);const rows=[];
 for(let trial=1;trial<=10;trial++){
  const d=JSON.parse(readFileSync(join(dir,'run-'+trial+'.json'),'utf8'));
  assert(d.requestedUrl===url,'URL mismatch '+slug+' trial '+trial);
  assert(d.lighthouseVersion==='12.8.2','Lighthouse version mismatch');
  const c=d.configSettings;
  assert(c.screenEmulation?.width===412&&c.screenEmulation?.height===823&&c.throttling?.cpuSlowdownMultiplier===4&&c.throttling?.rttMs===150,'Wrong mobile protocol');
  const sig=JSON.stringify([d.environment?.hostUserAgent,c.screenEmulation,c.throttling,c.throttlingMethod]);
  if(config===null)config=sig;
  assert(config===sig,'Browser/settings mismatch within this workflow');
  const val=id=>d.audits[id]?.numericValue;
  const lcp=val('largest-contentful-paint'),tbt=val('total-blocking-time'),cls=val('cumulative-layout-shift');
  assert([lcp,tbt,cls].every(Number.isFinite),'Missing metric');
  const entries=d.audits['largest-contentful-paint-element']?.details?.items??[];
  const tables=entries.filter(x=>x.type==='table').flatMap(x=>x.items??[]);
  const node=tables.find(x=>x.node)?.node;
  const phases=tables.filter(x=>x.phase).map(x=>({name:x.phase,timingMs:x.timing}));
  assert(node?.nodeLabel==='Каждое нажатие — шаг вперёд.','LCP is not actual Home H1');
  assert(phases.length===4,'Missing four LCP phases');
  const trace=d.audits['lcp-breakdown-insight']?.details?.items?.filter(x=>x.type==='table').flatMap(x=>x.items??[])??[];
  const film=d.audits['screenshot-thumbnails']?.details?.items??[];
  assert(film.length>0,'No raw filmstrip');
  rows.push({trial,lcp,tbt,cls,node:{label:node.nodeLabel,selector:node.selector},phases,trace,film});
 }
 const m=median(rows.map(r=>r.lcp)),chosen=[...rows].sort((a,b)=>Math.abs(a.lcp-m)-Math.abs(b.lcp-m))[0];
 const strip=chosen.film.map(x=>{
  const b64=String(x.data).split('base64,')[1];assert(Boolean(b64),'Invalid JPEG frame');
  const file='run-'+chosen.trial+'-filmstrip-'+x.timing+'.jpg';
  writeFileSync(join(dir,file),Buffer.from(b64,'base64'));
  return {ms:x.timing,file};
 });
 const range=key=>({median:median(rows.map(r=>r[key])),min:Math.min(...rows.map(r=>r[key])),max:Math.max(...rows.map(r=>r[key]))});
 const report={sourceSha:process.env.GITHUB_SHA,url,n:10,LCP:range('lcp'),TBT:range('tbt'),CLS:range('cls'),
  lcpElement:chosen.node,representativeRun:chosen.trial,representativeLCP:chosen.lcp,
  simulatedFourPhases:chosen.phases,tracePhasesSeparateClock:chosen.trace,filmstrip:strip,fullInteractiveJsGzip:interactiveGzip,
  caveat:'Simulated LCP phases and raw trace insight are different timing domains. Screenshots are sampled, never exactly at LCP.'};
 writeFileSync(join(dir,'summary.json'),JSON.stringify(report,null,2));
 summary.routes[slug]={url,LCP:report.LCP,TBT:report.TBT,CLS:report.CLS,element:report.lcpElement,representative:chosen.trial};
 console.log('ITER6_URL_PARITY '+JSON.stringify({...report,filmstrip:strip.map(x=>x.ms)}));
}
writeFileSync(join(root,'comparison.json'),JSON.stringify(summary,null,2));
console.log('ITER6_URL_PARITY_SUMMARY '+JSON.stringify(summary));
