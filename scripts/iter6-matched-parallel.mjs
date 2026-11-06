import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
const [kind,arg1,arg2,arg3,arg4]=process.argv.slice(2);
const root='performance-artifacts/iter6-matched';
const required=(v,msg)=>{if(!v)throw Error(msg);};
const metric=(j,name)=>j.audits[name]?.numericValue??null;
const describe=vals=>{
 const a=vals.filter(Number.isFinite).sort((x,y)=>x-y);
 required(a.length===vals.length&&a.length===10,'Ten valid observations mandatory');
 const q=p=>{const x=(a.length-1)*p,i=Math.floor(x);return a[i]+(a[Math.min(a.length-1,i+1)]-a[i])*(x-i);};
 return {n:a.length,median:q(.5),min:a[0],max:a[9],p05:q(.05),p95:q(.95),raw:vals};
};
const sha={main:'0a7d167bc320b503a03dfe1247c96687526ca28b',iter5:'244c5060b37ba9d802dbad796b3ce1ed562f5339',iter6:process.env.GITHUB_SHA};

if(kind==='variant'){
 const [route,variant,dist,folder]=[arg1,arg2,arg3,arg4];
 required(['home','academy','practice','analytics','profile'].includes(route),'Bad route');
 required(['main','iter5','iter6'].includes(variant),'Bad variant');
 const rows=[];
 for(let i=1;i<=10;i++){
  const file=join(folder,'run-'+i+'.json');
  const j=JSON.parse(readFileSync(file,'utf8'));
  const settings=j.configSettings, UA=j.environment?.hostUserAgent??null;
  const values={trial:i,lcpMs:metric(j,'largest-contentful-paint'),cls:metric(j,'cumulative-layout-shift'),tbtMs:metric(j,'total-blocking-time'),
   performance:100*(j.categories.performance?.score??NaN),version:j.lighthouseVersion,UA,
   settings:{throttling:settings?.throttling,screenEmulation:settings?.screenEmulation,formFactor:settings?.formFactor},
   lcpElement:j.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.nodeLabel??null};
  required([values.lcpMs,values.cls,values.tbtMs,values.performance].every(Number.isFinite),'Lighthouse incomplete trial '+i);
  const requests=j.audits['network-requests']?.details?.items??[];
  const scripts=[...new Set(requests.filter(r=>r.resourceType==='Script'||/javascript/i.test(r.mimeType??'')).map(r=>{
   try{const u=new URL(r.url);return u.pathname.replace(/^\/+/,'');}catch{return '';}
  }).filter(Boolean))];
  values.requestedJsFiles=scripts;
  values.requestedGzipBytes=scripts.reduce((total,file)=>{
   const path=join(dist,file);
   return total+(existsSync(path)&&statSync(path).isFile()?gzipSync(readFileSync(path)).length:0);
  },0);
  rows.push(values);
 }
 required(rows.every(r=>r.version==='12.8.2'),'Wrong Lighthouse version');
 const config=JSON.stringify(rows[0].settings);
 required(rows.every(r=>JSON.stringify(r.settings)===config),'Config drift within 10 runs');
 required(rows.every(r=>r.UA===rows[0].UA),'Browser drift within 10 runs');
 const screen=rows[0].settings.screenEmulation,t=rows[0].settings.throttling;
 required(screen?.width===412&&screen?.height===823&&t?.cpuSlowdownMultiplier===4&&t?.rttMs===150,'Wrong mobile throttling');
 const summary={route,variant,sha:sha[variant],n:10,
  LCP:describe(rows.map(r=>r.lcpMs)),TBT:describe(rows.map(r=>r.tbtMs)),CLS:describe(rows.map(r=>r.cls)),
  Performance:describe(rows.map(r=>r.performance)),requestedJsGzip:describe(rows.map(r=>r.requestedGzipBytes)),
  UA:rows[0].UA,version:rows[0].version,settings:rows[0].settings,
  lcpElementLabels:[...new Set(rows.map(r=>r.lcpElement))],
  observedJsRequests:rows.map(r=>({trial:r.trial,files:r.requestedJsFiles,requestedGzipBytes:r.requestedGzipBytes})),
  note:'Matched same-runner route-level comparison. Requested JS gzip bytes reconstructed from local built assets; excludes cache/compression transfer effect. No device claim.'};
 writeFileSync(join(folder,'summary.json'),JSON.stringify(summary,null,2));
 console.log('ITER6_PARALLEL_ROUTE_VARIANT '+JSON.stringify({route,variant,sha:summary.sha,n:10,lcp:summary.LCP.median,tbt:summary.TBT.median,cls:summary.CLS.median,requestedJsGzip:summary.requestedJsGzip.median,performance:summary.Performance.median,lcpElement:summary.lcpElementLabels}));
}else if(kind==='aggregate'){
 const all=[];
 for(const route of ['home','academy','practice','analytics','profile'])for(const variant of ['main','iter5','iter6']){
  const j=JSON.parse(readFileSync(join(root,route,variant,'summary.json'),'utf8'));
  all.push({route,variant,sha:j.sha,n:10,LCP:j.LCP.median,LCPmin:j.LCP.min,LCPmax:j.LCP.max,TBT:j.TBT.median,CLS:j.CLS.median,requestedJsGzip:j.requestedJsGzip.median,Performance:j.Performance.median,element:j.lcpElementLabels});
 }
 const comparison={sha,scope:'Five route-scoped ubuntu-24.04 runners; within each route the three refs are sequential on the SAME runner. Lighthouse 12.8.2 412×823 CPU×4 RTT150ms. Different route runners should not be compared as if matched hardware.',rows:all};
 writeFileSync(join(root,'comparison.json'),JSON.stringify(comparison,null,2));
 console.log('ITER6_PARALLEL_5_ROUTE_3SHA '+JSON.stringify(comparison));
}else throw Error('Use variant <route> <variant> <dist> <output> or aggregate');
