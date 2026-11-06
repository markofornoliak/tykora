import {readFileSync,writeFileSync} from 'node:fs';
const [command,variant]=process.argv.slice(2);
if(command==='patch'){
 const app='src/app/App.tsx',css='src/styles/app.css';
 let source=readFileSync(app,'utf8');
 const before='<Suspense fallback={<div role="status" className="sr-only">Загрузка раздела…</div>}><Outlet/></Suspense>';
 const after='<Suspense fallback={<div role="status" className="route-loading" aria-live="polite">Загрузка раздела…</div>}><Outlet/></Suspense>';
 if(source.split(before).length!==2)throw Error('Suspense anchor not unique; reject patch');
 source=source.replace(before,after);
 writeFileSync(app,source);
 let style=readFileSync(css,'utf8');
 if(style.includes('.route-loading'))throw Error('Fallback selector already exists');
 // Deep-route-only user-visible loading status. Home markup and its H1 untouched.
 style+='\n.route-loading{min-height:100vh;display:grid;place-items:center}\n';
 writeFileSync(css,style);
 console.log('ITER6_CLS_LAB_PATCH applied in disposable checkout, no product branch changes');
}else if(command==='summarize'){
 if(!['baseline','candidate'].includes(variant))throw Error('Unknown variant');
 const rows=[];
 for(let i=1;i<=10;i++){
  const j=JSON.parse(readFileSync('performance-artifacts/iter6-cls-lab/'+variant+'/run-'+i+'.json','utf8'));
  const a=j.audits;
  const cls=a['cumulative-layout-shift']?.numericValue,lcp=a['largest-contentful-paint']?.numericValue,tbt=a['total-blocking-time']?.numericValue;
  if(![cls,lcp,tbt].every(Number.isFinite))throw Error('Missing Lighthouse metric');
  const unstable=a['layout-shifts']?.details?.items??[];
  rows.push({trial:i,cls,lcp,tbt,unstable:unstable.map(x=>({selector:x.node?.selector,score:x.score})),lighthouseVersion:j.lighthouseVersion,config:j.configSettings});
 }
 const med=k=>{const v=rows.map(x=>x[k]).sort((a,b)=>a-b);return(v[4]+v[5])/2;};
 const summary={variant,sourceSha:process.env.GITHUB_SHA,n:10,medianCls:med('cls'),medianLcpMs:med('lcp'),medianTbtMs:med('tbt'),minCls:Math.min(...rows.map(r=>r.cls)),maxCls:Math.max(...rows.map(r=>r.cls)),rows};
 writeFileSync('performance-artifacts/iter6-cls-lab/'+variant+'/summary.json',JSON.stringify(summary,null,2));
 console.log('ITER6_CLS_LAB '+JSON.stringify({variant,sha:summary.sourceSha,n:10,cls:summary.medianCls,lcp:summary.medianLcpMs,tbt:summary.medianTbtMs,clsRange:[summary.minCls,summary.maxCls]}));
}else throw Error('usage: patch or summarize baseline/candidate');
