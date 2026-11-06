import {readFileSync,readdirSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
const root='dist',out='performance-artifacts/iter6-bundle';
mkdirSync(out,{recursive:true});
const files=readdirSync(join(root,'assets')).filter(x=>x.endsWith('.js')).sort();
const packageName=path=>{
 const parts=path.replaceAll('\\','/').split('/node_modules/');
 if(parts.length<2)return 'TYKORA source';
 const last=parts.at(-1).replace(/^\.pnpm\/[^/]+\/node_modules\//,'');
 const fragments=last.split('/');
 return fragments[0]?.startsWith('@')?fragments.slice(0,2).join('/'):fragments[0];
};
const rows=files.map(file=>{
 const buf=readFileSync(join(root,'assets',file));
 const smap=join(root,'assets',file+'.map');
 const grouped=new Map();
 const sources=[];
 if(existsSync(smap)){
  const raw=JSON.parse(readFileSync(smap,'utf8'));
  (raw.sources??[]).forEach((path,i)=>{
   const bytes=Buffer.byteLength(raw.sourcesContent?.[i]??'');
   const key=packageName(path);
   const stats=grouped.get(key)??{modules:0,sourceBytes:0};
   stats.modules++;stats.sourceBytes+=bytes;grouped.set(key,stats);
   sources.push({path,sourceBytes:bytes,group:key});
  });
 }
 return {file:'assets/'+file,rawBytes:buf.length,gzipBytes:gzipSync(buf).length,
  sourcemapFound:existsSync(smap),moduleCount:sources.length,
  groups:[...grouped].map(([group,stats])=>({group,...stats})).sort((a,b)=>b.sourceBytes-a.sourceBytes),
  modules:sources.sort((a,b)=>b.sourceBytes-a.sourceBytes)};
});
const special=readdirSync(root).filter(file=>file.endsWith('.js'));
for(const file of special){
 const path=join(root,file);
 if(existsSync(path)){
  const data=readFileSync(path);
  rows.push({file,rawBytes:data.length,gzipBytes:gzipSync(data).length,sourcemapFound:false,moduleCount:null,groups:[],modules:[]});
 }
}
const result={sha:process.env.GITHUB_SHA??'local',
 build:'Opt-in lab-only Vite build --sourcemap; normal product build unchanged. No source maps deployed.',
 rows:rows.sort((a,b)=>b.gzipBytes-a.gzipBytes),
 limitation:'Per-module sourceBytes measure uncompressed original sources for attribution. They are NOT additive gzip contributions, since minification/tree-shaking/compression cross module boundaries. Chunk gzip totals are exact local gzipSync bytes.'};
writeFileSync(join(out,'module-ledger.json'),JSON.stringify(result,null,2));
console.log('ITER6_BUNDLE_SOURCE_MAP '+JSON.stringify({
 sha:result.sha,chunks:result.rows.map(({file,gzipBytes,moduleCount,groups})=>({file,gzipBytes,moduleCount,largestGroups:groups.slice(0,8)}))
}).slice(0,35000));
if(!rows.some(r=>r.file.includes('bootstrap-')&&r.sourcemapFound&&r.moduleCount>0))throw Error('React bootstrap sourcemap missing; cannot assign modules');
