import {expect,test} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';

test('real Home LCP heading retains its DOM identity through hydration',async({page,browserName})=>{
 let release:()=>void=()=>{};
 const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/assets/bootstrap-*.js',async route=>{await gate;await route.continue();});
 await page.addInitScript(()=>{
  const w=window as unknown as {__ITER6_PROBE__?:{hydrated:boolean;original:Element|null;records:Array<{tag:string;text:string;startTime:number}>}};
  w.__ITER6_PROBE__={hydrated:false,original:null,records:[]};
  window.addEventListener('tykora:hydrated',()=>{if(w.__ITER6_PROBE__)w.__ITER6_PROBE__.hydrated=true;});
  try{
   new PerformanceObserver(list=>{
    for(const entry of list.getEntries()){
     const e=entry as PerformanceEntry&{element?:Element;startTime:number};
     w.__ITER6_PROBE__?.records.push({tag:e.element?.tagName??'',text:e.element?.textContent?.trim().slice(0,100)??'',startTime:e.startTime});
    }
   }).observe({type:'largest-contentful-paint',buffered:true});
  }catch{/* Firefox/WebKit may not expose LCP PerformanceObserver. */}
 });
 try{
  await page.goto('/#/',{waitUntil:'domcontentloaded'});
  const heading=page.getByRole('heading',{level:1,name:'Каждое нажатие — шаг вперёд.'});
  await expect(heading).toBeVisible();
  await page.evaluate(()=>{
   const w=window as unknown as {__ITER6_PROBE__?:{original:Element|null}};
   if(w.__ITER6_PROBE__)w.__ITER6_PROBE__.original=document.querySelector('main h1');
  });
  const before=await heading.evaluate(el=>({text:el.textContent,rect:el.getBoundingClientRect().toJSON(),html:el.outerHTML}));
  release();
  await expect.poll(()=>page.evaluate(()=>{
   const w=window as unknown as {__ITER6_PROBE__?:{hydrated:boolean}};
   return Boolean(w.__ITER6_PROBE__?.hydrated);
  }),{timeout:15000}).toBe(true);
  await expect(heading).toBeVisible();
  const after=await page.evaluate(()=>{
   const w=(window as unknown as {__ITER6_PROBE__?:{original:Element|null;records:unknown[]}}).__ITER6_PROBE__;
   const node=document.querySelector('main h1');
   return {sameNode:w?.original===node,isConnected:w?.original?.isConnected??false,
    text:node?.textContent??null,records:w?.records??[],
    cta:document.querySelector('.feature a')?.textContent?.trim()??null};
  });
  mkdirSync('performance-artifacts/iter6-lcp/dom',{recursive:true});
  writeFileSync('performance-artifacts/iter6-lcp/dom/'+browserName+'.json',JSON.stringify({before,after},null,2));
  console.log('ITER6_HYDRATED_H1 '+JSON.stringify({browserName,before,after}));
  expect(after.sameNode).toBe(true);
  expect(after.isConnected).toBe(true);
  expect(after.text).toBe(before.text);
  expect(after.cta).toBeTruthy();
  if(browserName==='chromium')expect(after.records.length).toBeGreaterThan(0);
 }finally{release();}
});
