import {chromium,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';

const output='performance-artifacts/iter6-memory';
mkdirSync(output,{recursive:true});
const INPUT=('steady typing science analysis practice '.repeat(20)).slice(0,500);
const browser=await chromium.launch({headless:true,args:['--js-flags=--expose-gc']});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const page=await context.newPage();
const cdp=await context.newCDPSession(page);
const measurement={sha:process.env.GITHUB_SHA??'unknown',browser:browser.version(),
  scenario:'5 finished 500-character custom-text sessions in one document; restart after each, then forced GC and a stable 250ms settle',
  samples:[],heapSnapshotPaths:[]};
const getListeners=async(expression,depth)=>{
  try{
    const runtime=await cdp.send('Runtime.evaluate',{expression,returnByValue:false});
    if(!runtime.result?.objectId)return null;
    const data=await cdp.send('DOMDebugger.getEventListeners',{objectId:runtime.result.objectId,depth,pierce:false});
    await cdp.send('Runtime.releaseObject',{objectId:runtime.result.objectId});
    return data.listeners?.length??null;
  }catch{return null;}
};
const getDetached=async()=>{
  try{const d=await cdp.send('DOM.getDetachedDomNodes');return d.detachedNodes?.length??null;}
  catch{return null;}
};
async function measure(session){
  await page.waitForTimeout(250);
  await cdp.send('HeapProfiler.collectGarbage');
  const response=await cdp.send('Performance.getMetrics');
  const values=Object.fromEntries(response.metrics.map(m=>[m.name,m.value]));
  const dom=await page.evaluate(()=>({
    nodes:document.getElementsByTagName('*').length,
    typingTextLength:document.querySelector('#typing-input')?.value.length??null
  }));
  const entry={session,heapUsedBytes:values.JSHeapUsedSize??null,
    jsEventListeners:values.JSEventListeners??null,
    nodes:dom.nodes,typingTextLength:dom.typingTextLength,
    detachedDomNodes:await getDetached(),
    documentTreeListeners:await getListeners('document',-1),
    windowListeners:await getListeners('window',0)};
  if(!Number.isFinite(entry.heapUsedBytes))throw Error('CDP heap metric unavailable');
  measurement.samples.push(entry);
  console.log('ITER6_HEAP_SAMPLE '+JSON.stringify(entry));
}
async function snapshot(name){
  await cdp.send('HeapProfiler.collectGarbage');
  const chunks=[];
  const onChunk=e=>chunks.push(e.chunk);
  cdp.on('HeapProfiler.addHeapSnapshotChunk',onChunk);
  try{await cdp.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false});}
  finally{cdp.off('HeapProfiler.addHeapSnapshotChunk',onChunk);}
  if(chunks.length===0)throw Error('Empty heap snapshot '+name);
  const path=output+'/'+name+'.heapsnapshot.gz';
  writeFileSync(path,gzipSync(Buffer.from(chunks.join(''))));
  measurement.heapSnapshotPaths.push({name,path,bytes:chunks.join('').length});
}
try{
 await page.goto((process.env.BENCH_BASE_URL??'http://127.0.0.1:4174')+'/#/practice');
 await page.locator('#practice-mode').selectOption('custom');
 await page.locator('#custom-text').fill(INPUT);
 await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
 await expect(page.locator('#typing-input')).toBeEnabled();
 await cdp.send('Performance.enable');
 await cdp.send('HeapProfiler.enable');
 await cdp.send('DOM.enable');
 await measure(0);
 await snapshot('baseline');
 for(let session=1;session<=5;session++){
   const input=page.locator('#typing-input');
   await input.focus();
   await page.keyboard.type(INPUT,{delay:1});
   await expect(input).toBeDisabled({timeout:30000});
   await expect(page.getByRole('button',{name:/Полный результат/})).toBeEnabled({timeout:30000});
   await page.getByRole('button',{name:/↺/}).click();
   await expect(input).toBeEnabled();
   await expect(input).toHaveValue('');
   await measure(session);
 }
 await snapshot('after-five');
 const samples=measurement.samples;
 const x=samples.map((_,i)=>i),y=samples.map(s=>s.heapUsedBytes);
 const meanX=x.reduce((a,b)=>a+b,0)/x.length,meanY=y.reduce((a,b)=>a+b,0)/y.length;
 const slope=x.reduce((sum,v,i)=>sum+(v-meanX)*(y[i]-meanY),0)
   /x.reduce((sum,v)=>sum+(v-meanX)**2,0);
 measurement.heapSlopeBytesPerSession=slope;
 measurement.heapDeltaBytes=y.at(-1)-y[0];
 measurement.allFiveSessionsCompleted=true;
 measurement.note='GC-stabilized sequential identical sessions. A positive slope alone is not a proven leak; compare detach counts, listeners and heap snapshot retainers. Headless Chromium is not a physical device.';
 writeFileSync(output+'/report.json',JSON.stringify(measurement,null,2));
 console.log('ITER6_MEMORY_REPORT '+JSON.stringify({
  sha:measurement.sha,heapSlopeBytesPerSession:slope,
  heapDeltaBytes:measurement.heapDeltaBytes,
  samples:measurement.samples
 }));
}finally{
 await context.close();
 await browser.close();
}
