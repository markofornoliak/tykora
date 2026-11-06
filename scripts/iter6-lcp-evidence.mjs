import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
const root='performance-artifacts/iter6-lcp';
const out=join(root,'evidence');
mkdirSync(out,{recursive:true});
const data=Array.from({length:10},(_,i)=>{
 const j=JSON.parse(readFileSync(join(root,'raw','iter6','run-'+(i+1)+'.json'),'utf8'));
 return {trial:i+1,ms:j.audits['largest-contentful-paint']?.numericValue,j};
});
if(data.some(x=>!Number.isFinite(x.ms)))throw Error('Missing LCP in trial');
const sorted=[...data].sort((a,b)=>a.ms-b.ms);
const median=(sorted[4].ms+sorted[5].ms)/2;
const chosen=[sorted[4],sorted[5]].sort((a,b)=>Math.abs(a.ms-median)-Math.abs(b.ms-median)||a.trial-b.trial)[0];
const audits=chosen.j.audits;
const interesting=Object.fromEntries(Object.entries(audits)
 .filter(([key])=>/lcp|largest-contentful-paint|screenshot|server-response-time/i.test(key))
 .map(([key,v])=>[key,{title:v.title,numericValue:v.numericValue,details:v.details}]));
writeFileSync(join(out,'lcp-raw-audits.json'),JSON.stringify(interesting,null,2));
const nodes=[];
function visit(obj,path='',depth=0){
 if(!obj||typeof obj!=='object'||depth>12)return;
 if(Array.isArray(obj)){obj.slice(0,100).forEach((value,i)=>visit(value,path+'['+i+']',depth+1));return;}
 if((obj.type==='node'||obj.nodeLabel)&&('snippet'in obj||'selector'in obj||'nodeLabel'in obj))
  nodes.push({path,selector:obj.selector??null,snippet:obj.snippet??null,nodeLabel:obj.nodeLabel??null});
 for(const [key,value] of Object.entries(obj))if(value&&typeof value==='object')visit(value,path+'.'+key,depth+1);
}
visit(interesting);
const stages=audits['lcp-breakdown-insight']?.details??null;
const frames=audits['screenshot-thumbnails']?.details?.items??[];
const exported=[];
for(let i=0;i<frames.length;i++){
 const item=frames[i],uri=item.data??item.screenshot;
 if(typeof uri!=='string')continue;
 const m=/^data:image\/(jpeg|jpg|png);base64,(.+)$/s.exec(uri);
 if(!m)continue;
 const file='frame-'+String(i+1).padStart(2,'0')+(m[1]==='png'?'.png':'.jpg');
 writeFileSync(join(out,file),Buffer.from(m[2],'base64'));
 exported.push({file,timingMs:item.timing??item.timestamp??null});
}
const timed=exported.filter(x=>Number.isFinite(x.timingMs)).sort((a,b)=>a.timingMs-b.timingMs);
const before=timed.filter(x=>x.timingMs<=chosen.ms).at(-1)??null;
const after=timed.find(x=>x.timingMs>=chosen.ms)??null;
const summary={
 sha:'d5bd96ca5611d73c70298eda7c7fd369b8ff1315',
 n:10,medianLcpMs:median,bracketing:sorted.slice(4,6).map(x=>({trial:x.trial,lcpMs:x.ms})),
 representative:{trial:chosen.trial,lcpMs:chosen.ms},
 lcpNodes:nodes.slice(0,30),stages,stageAuditKeys:Object.keys(interesting),
 filmstrip:{frames:exported,before,after},
 caveat:'Filmstrip frames are samples nearest to LCP, not an exact exposure of the composited frame at its timestamp.'
};
writeFileSync(join(out,'summary.json'),JSON.stringify(summary,null,2));
let html='<!doctype html><meta charset="utf-8"><title>TYKORA median LCP filmstrip</title><style>body{font:16px system-ui;padding:20px;background:#eee}figure{display:inline-block;background:white;padding:8px;margin:5px;vertical-align:top}img{max-width:260px}figcaption{max-width:260px}</style><h1>TYKORA LCP filmstrip</h1>';
html+='<p>N=10 median '+median+'ms. Representative run '+chosen.trial+' LCP='+chosen.ms+'ms.</p>';
for(const frame of exported)html+='<figure><img src="'+frame.file+'"><figcaption>'+frame.timingMs+'ms '+(before?.file===frame.file?' (last before LCP)':'')+(after?.file===frame.file?' (first after LCP)':'')+'</figcaption></figure>';
writeFileSync(join(out,'filmstrip.html'),html);
console.log('TYKORA_LCP_MEDIAN_AUDIT '+JSON.stringify(summary).slice(0,28000));
if(exported.length===0)throw Error('No extracted filmstrip frames: visual LCP not proven');
