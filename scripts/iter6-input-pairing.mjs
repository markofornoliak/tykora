import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const directory='performance-artifacts/iter6-input-pairing';mkdirSync(directory,{recursive:true});
const SOURCE=('science flow data steady signal typing research '.repeat(32)).slice(0,1250);
const SAMPLE=SOURCE.slice(0,500);
function percentile(values,p){const a=[...values].filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const k=(a.length-1)*p,i=Math.floor(k);return a[i]+(a[Math.min(i+1,a.length-1)]-a[i])*(k-i);}
function summarize(values){const a=values.filter(Number.isFinite);return {n:a.length,p50:percentile(a,.5),p95:percentile(a,.95),min:Math.min(...a),max:Math.max(...a)};}
const browser=await chromium.launch({headless:true});
const all=[];
try{
 for(const cpu of [1,4])for(let trial=1;trial<=10;trial++){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  await page.goto('http://127.0.0.1:4174/#/practice');
  await page.locator('#practice-mode').selectOption('custom');
  await page.locator('#custom-text').fill(SOURCE);
  await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
  const input=page.locator('#typing-input');await input.focus();
  await page.evaluate(()=>{
   const w=window;
   w.__ITER6_INPUT_PROBE__={keys:[],events:[]};
   let id=0;
   document.addEventListener('keydown',event=>{
    if(event.target?.id!=='typing-input')return;
    const record={id:++id,eventStamp:event.timeStamp,firstRaf:null,secondRaf:null,postRafTask:null};
    w.__ITER6_INPUT_PROBE__.keys.push(record);
    requestAnimationFrame(time=>{
     record.firstRaf=time;
     setTimeout(()=>{record.postRafTask=performance.now();},0);
     requestAnimationFrame(next=>{record.secondRaf=next;});
    });
   },{capture:true});
   try{
    new PerformanceObserver(list=>{
     for(const e of list.getEntries())if(e.name==='keydown')w.__ITER6_INPUT_PROBE__.events.push({
      startTime:e.startTime,duration:e.duration,interactionId:e.interactionId,
      processingStart:e.processingStart,processingEnd:e.processingEnd
     });
    }).observe({type:'event',durationThreshold:16});
   }catch{/* Chromium Event Timing supported on modern versions; counts reported. */}
  });
  await page.keyboard.type(SAMPLE,{delay:1});
  await page.waitForTimeout(500);
  const values=await page.evaluate(()=>({
   probe:window.__ITER6_INPUT_PROBE__,
   actual:document.querySelector('#typing-input')?.value??''
  }));
  if(values.actual!==SAMPLE)throw Error('Input loss at CPU '+cpu+' trial '+trial+': '+values.actual.length);
  const keys=values.probe.keys;
  if(keys.length!==500)throw Error('Missing event pairing: '+keys.length);
  const one=keys.map(k=>k.firstRaf===null?NaN:k.firstRaf-k.eventStamp);
  const two=keys.map(k=>k.secondRaf===null?NaN:k.secondRaf-k.eventStamp);
  const post=keys.map(k=>k.postRafTask===null?NaN:k.postRafTask-k.eventStamp);
  const pairs=values.probe.events.map(e=>{
   const closest=keys.map(k=>({id:k.id,distance:Math.abs(k.eventStamp-e.startTime)}))
      .sort((a,b)=>a.distance-b.distance)[0];
   return {...e,matchedKeyId:closest?.distance<=2?closest.id:null,
     distanceMs:closest?.distance??null};
  });
  const report={sha:process.env.GITHUB_SHA,cpu,trial,browser:browser.version(),accepted:500,
   rAF1:summarize(one),rAF2:summarize(two),afterRafTimer:summarize(post),
   eventTiming:summarize(pairs.map(e=>e.duration)),
   sampledEventCount:pairs.length,matchedEventCount:pairs.filter(x=>x.matchedKeyId!==null).length,
   caveat:'Each keydown is paired by timestamp to a first/second rAF and a post-rAF timer. These are frame-scheduling proxies, NOT actual compositor presentation or key-to-photon latency. Event Timing remains thresholded at >=16ms.',
   raw:{keys,events:pairs}};
  all.push(report);
  writeFileSync(directory+'/cpu'+cpu+'-trial'+trial+'.json',JSON.stringify(report,null,2));
  console.log('ITER6_INPUT_PAIR '+JSON.stringify({cpu,trial,accepted:500,rAF1:report.rAF1,rAF2:report.rAF2,eventTiming:report.eventTiming,matchedEvents:report.matchedEventCount,sampledEvents:report.sampledEventCount}));
  await context.close();
 }
}finally{await browser.close();}
const summary={sha:process.env.GITHUB_SHA,scenario:'500 exact keystrokes per trial, ten trials per CPU, Chromium CDP throttle 1x and 4x, 1280x900',
 measurements:[1,4].map(cpu=>{
  const rows=all.filter(r=>r.cpu===cpu);
  const med=key=>summarize(rows.map(key));
  return {cpu,n:10,allAccepted:rows.every(x=>x.accepted===500),
   rAF1TrialMedianMs:med(r=>r.rAF1.p50),rAF1TrialP95Ms:med(r=>r.rAF1.p95),
   rAF2TrialP95Ms:med(r=>r.rAF2.p95),
   eventTimingP95ObservedOnly:med(r=>r.eventTiming.p95),
   sampledEventCounts:rows.map(x=>x.sampledEventCount),
   matchedEventCounts:rows.map(x=>x.matchedEventCount)};
 }),
 limitation:'Actual input-to-presented-frame cannot be certified by rAF callbacks or thresholded PerformanceEventTiming; that summit goal remains NOT CONFIRMED. Physical GPU/real device needs owner-run script.'};
writeFileSync(directory+'/summary.json',JSON.stringify(summary,null,2));
console.log('ITER6_INPUT_PAIRING_SUMMARY '+JSON.stringify(summary));
