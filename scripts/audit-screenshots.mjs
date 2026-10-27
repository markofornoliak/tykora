import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const base=process.env.TYKORA_BASE_URL??'http://127.0.0.1:4174/';
const out=process.env.TYKORA_AUDIT_OUT??'docs/iteration4/audit/screens';
const routes=['','practice','academy','analytics','result','themes','race','profile','classroom'];
const themes=[
 {name:'Daylight',variant:'light',pair:'default'},
 {name:'Nightfall',variant:'dark',pair:'default'},
 {name:'Sandstone',variant:'light',pair:'warm'},
 {name:'Copper',variant:'dark',pair:'warm'},
 {name:'Porcelain',variant:'light',pair:'cool'},
 {name:'Ink',variant:'dark',pair:'cool'}
];
const widths=[320,768,1440];
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const rows=[];
for(const width of widths){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();
 const exceptions=[];
 page.on('pageerror',e=>exceptions.push(e.message));
 for(const theme of themes){
  await page.goto(new URL('#/themes',base).href,{waitUntil:'networkidle'});
  const choice=page.getByRole('button',{name:theme.name,exact:true});
  await choice.waitFor();
  await choice.click();
  await page.waitForTimeout(150);
  for(const route of routes){
   const url=new URL('#/'+route,base).href;
   await page.goto(url,{waitUntil:'networkidle'});
   await page.locator('main').waitFor();
   await page.waitForTimeout(120);
   const name=route||'home';
   const file=path.join(out,`${name}-${width}-${theme.variant}-${theme.pair}.png`);
   await page.screenshot({path:file,fullPage:true,animations:'disabled'});
   const docWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
   const overflow=Math.max(0,docWidth-width);
   const row={route:name,width,theme:theme.name,variant:theme.variant,file,overflow,errors:exceptions.splice(0)};
   if(width===768&&theme.pair==='default'){
    const results=await new AxeBuilder({page}).analyze();
    row.axe=results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}));
   }
   rows.push(row);
  }
 }
 await context.close();
}
await browser.close();
const report={tool:'Playwright Chromium + axe-core',screenshotCount:rows.length,rows};
fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(report,null,2)+'\n');
console.log('ITER4_VISUAL_AUDIT '+JSON.stringify({
 screenshots:rows.length,overflowCases:rows.filter(r=>r.overflow>0).length,
 browserExceptions:rows.reduce((sum,r)=>sum+r.errors.length,0),
 axeCriticalSerious:rows.filter(r=>r.axe?.some(v=>['critical','serious'].includes(v.impact))).length
}));
if(rows.length!==162||rows.some(r=>r.errors.length))process.exitCode=1;
// Overflow and axe findings are recorded, not silently called passing.
