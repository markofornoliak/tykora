import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const url=process.env.BENCH_BASE_URL??'http://127.0.0.1:4174';
const sha=process.env.GITHUB_SHA??'local';
const browser=await chromium.launch({headless:true,args:['--disable-background-timer-throttling']});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const cdp=await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await page.addInitScript(()=>{
 const w=window;
 w.__TYKORA_BENCHMARK__={practiceRenders:0,targetRenders:0,profilerCommits:0};
 w.__TYKORA_LAYOUT_SHIFTS__=[];
 try{new PerformanceObserver(list=>{for(const entry of list.getEntries()){if(!entry.hadRecentInput)w.__TYKORA_LAYOUT_SHIFTS__.push(entry.value);}}).observe({type:'layout-shift',buffered:true});}catch{/* No layout-shift API. */}
 w.__TYKORA_INPUT_EVENTS__=[];
 w.__TYKORA_EVENT_TIMING__=[];
 if(typeof PerformanceObserver!=='undefined'){
  try{
   new PerformanceObserver(list=>{
    for(const item of list.getEntries()){
     const e=item;
     if(e.name==='keydown'||e.name==='beforeinput'||e.name==='input'){
      w.__TYKORA_EVENT_TIMING__.push({name:e.name,startTime:e.startTime,duration:e.duration,processingStart:e.processingStart,processingEnd:e.processingEnd,presentationTime:e.startTime+e.duration,interactionId:e.interactionId});
     }
    }
   }).observe({type:'event',buffered:true,durationThreshold:16});
  }catch{/* Event Timing API unsupported; report null, never fabricate */}
 }
 window.addEventListener('input',e=>{
  if(e.target?.id!=='typing-input')return;
  const observed=performance.now(),nativeTime=e.timeStamp;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   w.__TYKORA_INPUT_EVENTS__.push({nativeTime,observed,upperBoundPaint:performance.now(),inputType:e.inputType});
  }));
 },true);
});
try{
 await page.goto(url+'/#/practice');
 const mode=page.locator('#practice-mode');await mode.waitFor();
 await mode.selectOption('custom');
 const source=('science flow data steady signal typing research '.repeat(32)).slice(0,1250);
 await page.locator('#custom-text').fill(source);
 await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
 const input=page.locator('#typing-input');await input.waitFor();
 await input.focus();
 await page.evaluate(()=>{window.__TYKORA_INPUT_EVENTS__.length=0;window.__TYKORA_EVENT_TIMING__.length=0;window.__TYKORA_BENCHMARK__.practiceRenders=0;window.__TYKORA_BENCHMARK__.targetRenders=0;window.__TYKORA_BENCHMARK__.profilerCommits=0;window.__TYKORA_LAYOUT_SHIFTS__.length=0;});
 const sample=source.slice(0,500);
 await page.keyboard.type(sample,{delay:1});
 await page.waitForTimeout(650);
 const r=await page.evaluate(()=>({actual:document.querySelector('#typing-input')?.value??'',inputs:window.__TYKORA_INPUT_EVENTS__,events:window.__TYKORA_EVENT_TIMING__,renders:window.__TYKORA_BENCHMARK__,layoutShifts:window.__TYKORA_LAYOUT_SHIFTS__,layoutShiftSupported:PerformanceObserver?.supportedEntryTypes?.includes('layout-shift')??false,eventTimingSupported:PerformanceObserver?.supportedEntryTypes?.includes('event')??false,hardwareConcurrency:navigator.hardwareConcurrency}));
 const sorted=r.inputs.map(x=>x.upperBoundPaint-x.nativeTime).filter(x=>Number.isFinite(x)&&x>=0).sort((a,b)=>a-b);
 const timings=r.events.filter(e=>e.interactionId>0&&e.name==='keydown').map(e=>e.duration).sort((a,b)=>a-b);
 const percentile=(vals,p)=>vals.length?vals[Math.ceil(vals.length*p)-1]:null;
 const report={sha,observedAt:new Date().toISOString(),scenario:'500 real keyboard.type calls in 1250 grapheme custom prompt, CPU 4x (CDP)',browser:browser.version(),viewport:'1280x900',cpuThrottleFactor:4,typingDelayMs:1,sourceGraphemes:[...source].length,expectedCharacters:sample.length,actualCharacters:r.actual.length,inputEvents:r.inputs.length,eventTimingSupported:r.eventTimingSupported,eventTimingKeydownSamples:timings.length,eventTimingP95ms:percentile(timings,.95),manualTwoRafUpperBoundP95ms:percentile(sorted,.95),manualTwoRafSamples:sorted.length,practiceRenderInvocations:r.renders.practiceRenders,targetRenderInvocations:r.renders.targetRenders,reactProfilerCommits:r.renders.profilerCommits,reactProfilerCommitsPerInput:r.inputs.length?r.renders.profilerCommits/r.inputs.length:null,practiceRenderInvocationsPerInput:r.inputs.length?r.renders.practiceRenders/r.inputs.length:null,targetRenderInvocationsPerInput:r.inputs.length?r.renders.targetRenders/r.inputs.length:null,clsSupported:r.layoutShiftSupported,cls:r.layoutShiftSupported?r.layoutShifts.reduce((a,b)=>a+b,0):null,deviceCores:r.hardwareConcurrency,notes:'Event Timing duration threshold >=16ms and quantization mean it does not measure all input-to-paint interactions. React Profiler counts commits; render-invocation counters count component calls (may include aborted renders). Two-RAF is upper bound, not exact paint.'};
 if(process.env.TYKORA_EXPECT_PROFILER==='1' && r.renders.profilerCommits===0)
   throw new Error('React profiling build did not report any commits: do not treat zero as a valid result');
 console.log('TYKORA_INPUT_BENCHMARK '+JSON.stringify(report));
 mkdirSync('performance-artifacts',{recursive:true});writeFileSync('performance-artifacts/input-benchmark.json',JSON.stringify(report,null,2));
 if(r.actual!==sample||r.inputs.length<sample.length*.95)throw new Error('Input loss or missing DOM input observations invalidates benchmark');
}finally{await browser.close();}
