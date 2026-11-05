import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
const dir='performance-artifacts/lcp-bisect';mkdirSync(dir,{recursive:true});
const rows=[];
for(let i=1;i<=5;i++){
 const l=JSON.parse(readFileSync(dir+'/run-'+i+'.json','utf8'));
 const requests=l.audits['network-requests']?.details?.items??[];
 rows.push({trial:i,lcpMs:l.audits['largest-contentful-paint']?.numericValue??null,
  cls:l.audits['cumulative-layout-shift']?.numericValue??null,
  lcpElement:l.audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet??null,
  perfScore:l.categories.performance?.score??null,benchmarkIndex:l.environment?.benchmarkIndex,
  scripts:requests.filter(x=>x.resourceType==='Script'||x.mimeType?.includes('javascript')).map(x=>({url:x.url,transferSize:x.transferSize??null})),
  throttling:l.configSettings?.throttling,version:l.lighthouseVersion});
}
const a=rows.map(r=>r.lcpMs).filter(Number.isFinite).sort((a,b)=>a-b);
if(a.length!==5)throw Error('Five LCP observations required');
const mean=a.reduce((s,x)=>s+x,0)/5,sd=Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/5);
const html=readFileSync('dist/index.html','utf8');
const entry=html.match(/src="[^"]*assets\/([^"]+\.js)"/)?.[1]??null;
const chunks=readdirSync('dist/assets').filter(x=>x.endsWith('.js'))
 .map(file=>({file,gzipBytes:gzipSync(readFileSync('dist/assets/'+file)).length}))
 .sort((a,b)=>b.gzipBytes-a.gzipBytes);
const report={sha:process.env.GITHUB_SHA,ref:process.env.BISECT_REF,medianLcpMs:a[2],meanLcpMs:mean,sdLcpMs:sd,
 rangeMs:[a[0],a[4]],entryJs:entry,entryGzipBytes:chunks.find(c=>c.file===entry)?.gzipBytes??null,
 chunks,rows,protocol:'Five simulated Lighthouse 12.8.2 mobile runs, CPU x4, 412x823, network RTT 150ms; NOT a physical Moto G Power'};
writeFileSync(dir+'/summary.json',JSON.stringify(report,null,2));
console.log('TYKORA_LCP_BISECT '+JSON.stringify({ref:report.ref,medianLcpMs:report.medianLcpMs,
 sdLcpMs:report.sdLcpMs,entryJs:entry,entryGzipBytes:report.entryGzipBytes,
 lcpElements:[...new Set(rows.map(r=>r.lcpElement))],largestChunks:chunks.slice(0,4)}));
