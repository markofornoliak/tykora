import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';

const root='performance-artifacts/iter6-one-runner';
const keys=['home','academy','practice','analytics','profile'];
const variants=['main','iter5','iter6'];
const reports=Object.fromEntries(variants.map(x=>[x,JSON.parse(readFileSync(join(root,x,'js.json'),'utf8'))]));
const rows=[];
for(const route of keys){
 const original=Object.fromEntries(variants.map(v=>{
  const data=reports[v].routes[route];
  if(data.n!==10||!data.stable)throw Error('No verified stable requested JS x10: '+v+' '+route);
  const b=data.bytes;
  if(![b.p50,b.p90,b.max].every(x=>Number.isFinite(x)&&x>0))throw Error('Missing gzip bytes '+v+' '+route);
  return [v,{p50:b.p50,p90:b.p90,max:b.max,sha:reports[v].sha}];
 }));
 const current=original.iter6.p50,base=original.iter5.p50;
 const gate=current<=base;
 const row={route,...original,deltaGzipBytes:current-base,deltaPct:100*(current-base)/base,passNoGrowth:gate,
  target105k:{bytes:105000,pass:current<=105000},target90k:{bytes:90000,pass:current<=90000}};
 rows.push(row);
 console.log('ITER6_JS_NO_GROWTH '+JSON.stringify({route,iter5Baseline:base,iter6:current,delta:row.deltaGzipBytes,pass:gate,sha:original.iter6.sha}));
}
const out={scope:'Cold requested JS after authentic H1 + network idle, 10 independent contexts per source per route; gzip of exact served dist files; historical main and iter5 pinned immutable.',targetBranch:'feature/iter6-summit',baseline:'iter5',rows,pass:rows.every(x=>x.passNoGrowth)};
mkdirSync(root,{recursive:true});
writeFileSync(join(root,'initial-js-gate.json'),JSON.stringify(out,null,2));
console.log('ITER6_JS_NO_GROWTH_SUMMARY '+JSON.stringify({passed:rows.filter(x=>x.passNoGrowth).length,total:rows.length,gate:out.pass,home105k:rows[0].target105k.pass,home90k:rows[0].target90k.pass}));
if(!out.pass)throw Error('Initial JS requested gzip exceeds immutable Iteration 5 baseline; no budget relaxation.');
