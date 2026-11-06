import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';

const [command,arg]=process.argv.slice(2);
if(command==='patch'){
 const file=join(arg,'src/app/store/uiStore.ts');
 let text=readFileSync(file,'utf8');
 const eager="import {repositories} from '../../infrastructure/di/repositories';";
 const lazy="const getRepositories=async()=> (await import('../../infrastructure/di/repositories')).repositories;";
 const beforeLoad="const loaded=await repositories.settings.load();";
 const afterLoad="const loaded=await (await getRepositories()).settings.load();";
 const beforeSave="await repositories.settings.save(settings);";
 const afterSave="await (await getRepositories()).settings.save(settings);";
 for(const [before,after] of [[eager,lazy],[beforeLoad,afterLoad],[beforeSave,afterSave]]){
  if(text.split(before).length!==2)throw Error('Patch anchor not unique: '+before);
  text=text.replace(before,after);
 }
 writeFileSync(file,text);
 console.log('ITER6_LAZY_DEXIE_PATCH '+JSON.stringify({path:file,onlyUiStore:true,sourceRuntimeUnchanged:true}));
}else if(command==='summarize'){
 const variant=arg;
 const out='performance-artifacts/iter6-dexie-lab';
 const metrics=[];
 const sizeDir=join('.iter6-dexie-'+variant,'dist');
 const files=readdirSync(join(sizeDir,'assets')).filter(x=>x.endsWith('.js'));
 const sizes=Object.fromEntries(files.map(x=>[x,gzipSync(readFileSync(join(sizeDir,'assets',x))).length]));
 const eagerFiles=files.filter(x=>x.startsWith('index-')||x.startsWith('bootstrap-'));
 const full=eagerFiles.reduce((s,x)=>s+sizes[x],0);
 const initial=eagerFiles.filter(x=>x.startsWith('bootstrap-')).reduce((s,x)=>s+sizes[x],0);
 for(const url of ['bare','hash']){
  const rows=[];
  for(let i=1;i<=10;i++){
   const x=JSON.parse(readFileSync(join(out,variant,url,'run-'+i+'.json'),'utf8'));
   const metric=id=>x.audits[id]?.numericValue;
   const node=x.audits['largest-contentful-paint-element']?.details?.items
    ?.flatMap(y=>y.type==='table'?y.items??[]:[])
    ?.find(y=>y.node)?.node;
   if(node?.nodeLabel!=='Каждое нажатие — шаг вперёд.')throw Error('Real H1 was not LCP');
   rows.push({trial:i,LCP:metric('largest-contentful-paint'),TBT:metric('total-blocking-time'),CLS:metric('cumulative-layout-shift'),perf:x.categories.performance?.score*100});
  }
  const median=key=>{const z=rows.map(r=>r[key]).sort((a,b)=>a-b);return(z[4]+z[5])/2;};
  metrics.push({variant,url,n:10,lcp:median('LCP'),tbt:median('TBT'),cls:median('CLS'),perf:median('perf'),allJsStaticBootstrapGzip:full,bootstrapChunkGzip:initial,mainJsChunks:eagerFiles,rows});
 }
 writeFileSync(join(out,variant,'summary.json'),JSON.stringify(metrics,null,2));
 metrics.forEach(x=>console.log('ITER6_LAZY_DEXIE_RESULT '+JSON.stringify({...x,rows:undefined})));
}else if(command==='compare'){
 const out='performance-artifacts/iter6-dexie-lab';
 const a=JSON.parse(readFileSync(join(out,'baseline','summary.json'),'utf8'));
 const b=JSON.parse(readFileSync(join(out,'candidate','summary.json'),'utf8'));
 const table=a.map((row,i)=>({url:row.url,before:row,after:b[i],deltaLcp:b[i].lcp-row.lcp,deltaTbt:b[i].tbt-row.tbt,deltaStartupGzip:b[i].allJsStaticBootstrapGzip-row.allJsStaticBootstrapGzip}));
 writeFileSync(join(out,'comparison.json'),JSON.stringify(table,null,2));
 console.log('ITER6_LAZY_DEXIE_COMPARE '+JSON.stringify(table.map(x=>({url:x.url,deltaLcp:x.deltaLcp,deltaTbt:x.deltaTbt,deltaStartupGzip:x.deltaStartupGzip}))));
}else throw Error('usage: patch PATH | summarize baseline/candidate | compare');
