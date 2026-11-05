import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='performance-artifacts/iter5-memory';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--js-flags=--expose-gc']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const cdp=await page.context().newCDPSession(page);
 await page.goto((process.env.BENCH_BASE_URL??'http://127.0.0.1:4174')+'/#/practice');
 await page.locator('#practice-mode').selectOption('custom');
 const text='x'.repeat(6000);
 await page.locator('#custom-text').fill(text);
 await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
 await page.locator('#typing-input').focus();
 await cdp.send('Performance.enable');
 const snapshots=[];
 for(let minute=0;minute<=10;minute++){
  if(minute>0){
   // A 10-minute live session with a bounded amount of new input each minute.
   await page.locator('#typing-input').fill('x'.repeat(minute*400));
   await page.waitForTimeout(60000);
  }
  await cdp.send('HeapProfiler.collectGarbage');
  const {metrics}=await cdp.send('Performance.getMetrics');
  const heap=metrics.find(m=>m.name==='JSHeapUsedSize')?.value??null;
  const dom=await page.evaluate(()=>({nodes:document.getElementsByTagName('*').length,typed:document.querySelector('#typing-input')?.value.length??0}));
  snapshots.push({minute,heapBytes:heap,domNodes:dom.nodes,typedCharacters:dom.typed});
  console.log('TYKORA_A2_HEAP '+JSON.stringify(snapshots.at(-1)));
 }
 const first=snapshots[0].heapBytes,last=snapshots.at(-1).heapBytes;
 const report={sha:process.env.GITHUB_SHA??'local',browser:browser.version(),snapshots,heapGrowthBytes:first!==null&&last!==null?last-first:null,
  limitation:'GC-forced CDP Performance.getMetrics. Linear growth inference requires review of all samples; idle GC and browser caches can vary. No external hardware claim.'};
 writeFileSync(out+'/memory.json',JSON.stringify(report,null,2));
 console.log('TYKORA_A2_MEMORY '+JSON.stringify(report));
}finally{await browser.close();}
