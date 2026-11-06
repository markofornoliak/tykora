import {readFileSync,readdirSync,writeFileSync,existsSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
const root='performance-artifacts/iter6-multiroute';
const routes=['home','academy','practice','analytics','profile'];
const variants=['main','iter5','iter6'];
const percentile=(values,p)=>{const a=[...values].sort((x,y)=>x-y);const k=(a.length-1)*p,i=Math.floor(k);return a[i]+(a[Math.min(i+1,a.length-1)]-a[i])*(k-i);};
const describe=a=>({n:a.length,median:percentile(a,.5),p05:percentile(a,.05),p95:percentile(a,.95),min:Math.min(...a),max:Math.max(...a)});
const sha={main:'0a7d167bc320b503a03dfe1247c96687526ca28b',iter5:'244c5060b37ba9d802dbad796b3ce1ed562f5339',iter6:process.env.GITHUB_SHA};
const entries=[],all=[];
for(const variant of variants)for(const route of routes){
 const rows=[];
 const dist=join(root,variant,'dist');
 for(let i=1;i<=10;i++){
  const j=JSON.parse(readFileSync(join(root,variant,route,'run-'+i+'.json'),'utf8'));
  const lcp=j.audits['largest-contentful-paint']?.numericValue,cls=j.audits['cumulative-layout-shift']?.numericValue,tbt=j.audits['total-blocking-time']?.numericValue;
  if(![lcp,cls,tbt].every(Number.isFinite))throw Error('Missing numeric metric '+variant+'/'+route+'/'+i);
  const perf=100*j.categories.performance.score;
  const lcpNode=j.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node??null;
  const requests=j.audits['network-requests']?.details?.items??[];
  const loaded=[...new Set(requests.filter(r=>r.resourceType==='Script'||/javascript/i.test(r.mimeType??'')).map(r=>{
   try{return new URL(r.url).pathname.replace(/^\/+/,'');}catch{return null;}
  }).filter(Boolean))];
  let requestedGzip=0;
  const scriptFiles=[];
  for(const path of loaded){
   const file=join(dist,path);
   if(existsSync(file)&&statSync(file).isFile()){
    const gzipBytes=gzipSync(readFileSync(file)).length;
    requestedGzip+=gzipBytes;
    scriptFiles.push({path,gzipBytes});
   }
  }
  rows.push({trial:i,lcpMs:lcp,cls,tbtMs:tbt,performance:perf,requestedJsGzipBytes:requestedGzip,
   lcpNodeLabel:lcpNode?.nodeLabel??null,lcpNodeSelector:lcpNode?.selector??null,
   scriptFiles,lhVersion:j.lighthouseVersion,userAgent:j.environment?.hostUserAgent,
   config:j.configSettings});
 }
 if(rows.some(r=>r.lhVersion!=='12.8.2'))throw Error('Lighthouse version mismatch '+variant+' '+route);
 const k=JSON.stringify({screen:rows[0].config.screenEmulation,throttle:rows[0].config.throttling,form:rows[0].config.formFactor});
 if(rows.some(r=>JSON.stringify({screen:r.config.screenEmulation,throttle:r.config.throttling,form:r.config.formFactor})!==k))throw Error('Config drift '+variant+' '+route);
 if(rows[0].config.screenEmulation?.width!==412||rows[0].config.screenEmulation?.height!==823||rows[0].config.throttling?.cpuSlowdownMultiplier!==4||rows[0].config.throttling?.rttMs!==150)throw Error('Incorrect emulation');
 const record={variant,sha:sha[variant],route,n:10,lcp:describe(rows.map(r=>r.lcpMs)),
   tbt:describe(rows.map(r=>r.tbtMs)),cls:describe(rows.map(r=>r.cls)),
   performance:describe(rows.map(r=>r.performance)),requestedJsGzip:describe(rows.map(r=>r.requestedJsGzipBytes)),
   lcpNodeLabels:[...new Set(rows.map(r=>r.lcpNodeLabel))],
   lcpNodeSelectors:[...new Set(rows.map(r=>r.lcpNodeSelector))],
   runs:rows.map(({trial,lcpMs,cls,tbtMs,performance,requestedJsGzipBytes,lcpNodeLabel,scriptFiles})=>({trial,lcpMs,cls,tbtMs,performance,requestedJsGzipBytes,lcpNodeLabel,scriptFiles}))};
 writeFileSync(join(root,variant,route,'summary.json'),JSON.stringify(record,null,2));
 all.push(record);
 entries.push({variant,sha:sha[variant],route,n:10,lcpMs:record.lcp.median,lcpRange:[record.lcp.min,record.lcp.max],
 tbtMs:record.tbt.median,cls:record.cls.median,requestedJsGzip:record.requestedJsGzip.median,
 lcpElement:record.lcpNodeLabels});
}
const result={protocol:'One ubuntu-24.04 runner; sequential variants; Lighthouse 12.8.2 mobile 412x823, CPUx4, RTT150ms; 10 trials per route/source; NOT physical device',
sha,rows:entries};
writeFileSync(join(root,'comparison.json'),JSON.stringify(result,null,2));
console.log('ITER6_MULTI_ROUTE_COMPARISON '+JSON.stringify(result).slice(0,45000));
