import {chromium} from '@playwright/test';
import {gzipSync} from 'node:zlib';
import {mkdirSync,writeFileSync} from 'node:fs';

const url=process.env.BENCH_BASE_URL??'http://127.0.0.1:4174';
const sha=process.env.GITHUB_SHA??'local';
const out='performance-artifacts/iter5-presentation';
mkdirSync(out,{recursive:true});
const SOURCE=('science flow data steady signal typing research '.repeat(32)).slice(0,1250);
const SAMPLE=SOURCE.slice(0,500);
const categories=[
 'devtools.timeline','disabled-by-default-devtools.timeline',
 'disabled-by-default-devtools.timeline.frame',
 'blink.user_timing','toplevel','loading','input','cc','latencyInfo','benchmark'
].join(',');
const percentile=(v,p)=>{const a=v.filter(Number.isFinite).sort((x,y)=>x-y);return a.length?a[Math.min(a.length-1,Math.ceil(a.length*p)-1)]:null;};
const summarize=(arr)=>({count:arr.length,p50:percentile(arr,.5),p95:percentile(arr,.95),p99:percentile(arr,.99),mean:arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null});
function groupedTrace(json){
 const bucket={};
 for(const e of json.traceEvents??[]){
  if(e.ph!=='X'||!Number.isFinite(e.dur))continue;
  const n=e.name??'unknown';
  if(!/RecalculateStyle|UpdateLayoutTree|Layout|Paint|Composite|Raster|DrawFrame|BeginMainThreadFrame|RunTask|FunctionCall|EventDispatch|FireAnimationFrame/i.test(n))continue;
  const b=bucket[n]??={count:0,sumMs:0,maxMs:0};
  const ms=e.dur/1000;
  b.count++;b.sumMs+=ms;b.maxMs=Math.max(b.maxMs,ms);
 }
 return Object.fromEntries(Object.entries(bucket).sort((a,b)=>b[1].sumMs-a[1].sumMs).slice(0,35).map(([k,v])=>[k,{count:v.count,sumMs:+v.sumMs.toFixed(3),maxMs:+v.maxMs.toFixed(3)}]));
}

function extractLatency(json){
 const matched=(json.traceEvents??[]).filter(e=>/EventLatency|PresentationFeedback|SubmitCompositorFrame/i.test(e.name??''));
 const stageCounts={};const complete=[];const stages={};const active=new Map();
 for(const e of matched){
  const label=String(e.name);stageCounts[label]=(stageCounts[label]??0)+1;
  if(e.ph==='X'&&Number.isFinite(e.dur)){
   if(label.includes('EventLatency'))complete.push(e.dur/1000);
   else(stages[label]??=[]).push(e.dur/1000);
  }
  const id=String(e.pid)+':'+String(e.id2?.local??e.id2?.global??e.id??'')+':'+label;
  if(e.ph==='b')active.set(id,e.ts);
  if(e.ph==='e'&&active.has(id)){
   const t=active.get(id);active.delete(id);
   if(label.includes('EventLatency')&&Number.isFinite(t))complete.push((e.ts-t)/1000);
  }
 }
 return {traceEventNames:stageCounts,unpairedEventLatency:summarize(complete),
  otherTraceStages:Object.fromEntries(Object.entries(stages).map(([k,v])=>[k,summarize(v)])),
  caveat:'Raw EventLatency cannot be mapped to 500 keydowns without IDs. Do not claim certified key-to-photon.'};
}
async function readTrace(cdp){
 const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
 await cdp.send('Tracing.end');
 const {stream}=await complete;
 if(!stream)throw new Error('CDP Tracing stream missing');
 let s='';
 while(true){
  const p=await cdp.send('IO.read',{handle:stream,size:65536});
  s+=p.base64Encoded?Buffer.from(p.data,'base64').toString('utf8'):p.data;
  if(p.eof)break;
 }
 await cdp.send('IO.close',{handle:stream});
 return s;
}
async function prepare(page){
 await page.goto(url+'/#/practice');
 await page.locator('#practice-mode').selectOption('custom');
 await page.locator('#custom-text').fill(SOURCE);
 await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
 const input=page.locator('#typing-input');
 await input.focus();
 await page.evaluate(()=>{
  window.__A2_METRICS__={events:[],twoRaf:[],oneRaf:[]};
  try{
   new PerformanceObserver(list=>{
    for(const e of list.getEntries()){
     if(e.name==='keydown'&&e.interactionId>0){
      window.__A2_METRICS__.events.push({
       delay:e.processingStart-e.startTime,
       processing:e.processingEnd-e.processingStart,
       presentation:Math.max(0,e.duration-(e.processingEnd-e.startTime)),
       total:e.duration
      });
     }
    }
   }).observe({type:'event',durationThreshold:16,buffered:false});
  }catch{/* Event Timing is optional and its absence is reported as zero samples. */}
  document.addEventListener('keydown',event=>{
   if(event.target?.id!=='typing-input')return;
   const start=performance.now();
   requestAnimationFrame(()=>{
    const first=performance.now();window.__A2_METRICS__.oneRaf.push(first-start);
    requestAnimationFrame(()=>window.__A2_METRICS__.twoRaf.push(performance.now()-start));
   });
  },{capture:true,passive:true});
 });
 return input;
}
async function bench(browser,cpu,trial,variant='baseline',saveTrace=true){
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage();
 const cdp=await context.newCDPSession(page);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
 const input=await prepare(page);
 if(variant!=='baseline')await page.evaluate(name=>{
  const node=document.querySelector('[data-typing-window="bounded"]');
  if(!node)throw new Error('Typing window not found');
  if(name==='contain')node.style.contain='layout paint style';
  else if(name==='content-visibility'){node.style.contentVisibility='auto';node.style.containIntrinsicSize='auto 190px';}
  else if(name==='remove-effects'){
   const s=document.createElement('style');
   s.textContent='.target-text,.target-text *{box-shadow:none!important;text-shadow:none!important;filter:none!important;backdrop-filter:none!important}';
   document.head.append(s);
  }else if(name==='transform-caret'){
   const s=document.createElement('style');
   s.textContent='.target-text .caret::before{transform:translate3d(0,0,0);will-change:transform}';
   document.head.append(s);
  }else if(name==='hide-keyboard'){
   document.querySelector('.keyboard-card')?.remove();
  }else throw new Error('Unknown experiment: '+name);
 },variant);
 await cdp.send('Tracing.start',{transferMode:'ReturnAsStream',categories});
 await page.keyboard.type(SAMPLE,{delay:1});
 await page.waitForTimeout(800);
 const traceRaw=await readTrace(cdp);
 const raw=JSON.parse(traceRaw);
 const data=await page.evaluate(()=>({
  value:document.querySelector('#typing-input')?.value??'',
  metrics:window.__A2_METRICS__,
  domNodes:document.querySelectorAll('[data-typing-window="bounded"] span').length,
  charCount:document.querySelector('[data-typing-window="bounded"]')?.textContent?.length??0
 }));
 const keys=['delay','processing','presentation','total'];
 const breakdown=Object.fromEntries(keys.map(k=>[k,summarize(data.metrics.events.map(e=>e[k]))]));
 const report={sha,browser:browser.version(),cpu,trial,variant,accepted:data.value.length,expected:SAMPLE.length,exactText:data.value===SAMPLE,eventTimingSamples:data.metrics.events.length,
  breakdown,oneRaf:summarize(data.metrics.oneRaf),twoRafUpperBound:summarize(data.metrics.twoRaf),
  traceTasks:groupedTrace(raw),cdpLatency:extractLatency(raw),domNodes:data.domNodes,charCount:data.charCount,traceEvents:raw.traceEvents?.length??0,
  limitation:'event entries sampled only at >=16ms; one/two rAF are NOT actual presentation timestamps; trace task sums overlap and are not exclusive frame accounting'
 };
 const prefix=out+'/'+variant+'-cpu'+cpu+'-run'+trial;
 writeFileSync(prefix+'.json',JSON.stringify(report,null,2));
 if(saveTrace)writeFileSync(prefix+'.trace.json.gz',gzipSync(Buffer.from(traceRaw),{level:6}));
 console.log('TYKORA_A2_TRACE '+JSON.stringify({cpu,trial,variant,eventP95:breakdown.total.p95,delayP95:breakdown.delay.p95,processingP95:breakdown.processing.p95,presentationP95:breakdown.presentation.p95,oneRafP95:report.oneRaf.p95,twoRafP95:report.twoRafUpperBound.p95,accepted:report.accepted,traceTasks:report.traceTasks}));
 await context.close();
 if(!report.exactText)throw new Error('Input loss in '+prefix);
 return report;
}
const browser=await chromium.launch({headless:true,args:['--disable-background-timer-throttling']});
try{
 const runs=[];
 for(const cpu of [1,4]){
  for(let trial=1;trial<=5;trial++)runs.push(await bench(browser,cpu,trial,'baseline',true));
 }
 const candidates=[]; // Skip single-sample CSS experiments in this 5×2 measurement pass.
 const compare=key=>Object.fromEntries([1,4].map(cpu=>{
  const values=runs.filter(r=>r.cpu===cpu).map(r=>key(r));
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const sd=Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/values.length);
  return ['cpu'+cpu,{samples:values,mean,sd,min:Math.min(...values),max:Math.max(...values)}];
 }));
 const summary={sha,browser:browser.version(),reference:runs.map(r=>({cpu:r.cpu,trial:r.trial,eventSamples:r.eventTimingSamples,p50:r.breakdown.total.p50,p95:r.breakdown.total.p95,p99:r.breakdown.total.p99,inputDelayP95:r.breakdown.delay.p95,processingTimeP95:r.breakdown.processing.p95,presentationDelayP95:r.breakdown.presentation.p95,oneRafP95:r.oneRaf.p95,twoRafUpperBoundP95:r.twoRafUpperBound.p95})),
  variability:{eventP50:compare(r=>r.breakdown.total.p50),eventP95:compare(r=>r.breakdown.total.p95),eventP99:compare(r=>r.breakdown.total.p99),oneRafP95:compare(r=>r.oneRaf.p95),twoRafP95:compare(r=>r.twoRafUpperBound.p95)},
  experiments:candidates,cdpLatency:runs.map(r=>({cpu:r.cpu,trial:r.trial,raw:r.cdpLatency})),
  sampleCaveat:'Five runs each throttle; Event Timing is quantized and only samples >=16ms; CDP EventLatency slices are unpaired unless event interaction ID can be verified. Physical presentation not certified.',
  excludedCandidates:{
   wordClass:'Per-word class replacement loses per-grapheme error/caret semantics without nested spans; not accepted without equivalent renderer and a11y regression.',
   passive:'React input, composition, keydown, paste semantics cannot all be passive: preventDefault on paste/drop is required. Added passive only to observational keydown listener.',
   beforeInput:'Raw value from native input remains authoritative for IME/dead keys/AltGr; moving scoring to keydown would be semantically wrong.',
   workerBatch:'No worker postMessage exists on each key: scoreAsync runs only on completion; batching per-key worker messages is inapplicable.',
   idleDb:'Completed-session write already scheduled in requestIdleCallback with fallback; not in keypress handler.'
  }
 };
 writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2));
 console.log('TYKORA_PRESENTATION_SUMMARY '+JSON.stringify(summary));
}finally{await browser.close();}
