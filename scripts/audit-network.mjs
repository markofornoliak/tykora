import {chromium} from '@playwright/test';
import fs from 'node:fs';
const origin=new URL(process.env.TYKORA_BASE_URL??'http://127.0.0.1:4174/').origin;
const pages=['','practice','academy','analytics','result','themes','race','profile','classroom'];
const browser=await chromium.launch();
const ctx=await browser.newContext();
const external=[],rows=[];
for(const route of pages){
 const page=await ctx.newPage(),requests=[];
 page.on('request',r=>{
  const url=r.url();
  if(url.startsWith('data:')||url.startsWith('blob:'))return;
  const u=new URL(url);
  requests.push({url,method:r.method(),type:r.resourceType()});
  if(u.origin!==origin)external.push({route:route||'home',url,method:r.method()});
 });
 const target=new URL('#/'+route,origin+'/').href;
 const response=await page.goto(target,{waitUntil:'networkidle'});
 await page.locator('main').waitFor({timeout:20000});
 await page.waitForTimeout(500);
 rows.push({route:route||'home',httpStatus:response?.status()??null,requestCount:requests.length,requests});
 await page.close();
}
await browser.close();
const out='docs/iteration4/audit/network.json';fs.mkdirSync('docs/iteration4/audit',{recursive:true});
fs.writeFileSync(out,JSON.stringify({tool:'Playwright Chromium request events; 9 passive production routes',origin,rows,external},null,2)+'\n');
console.log('ITER4_NETWORK '+JSON.stringify({routes:rows.length,requestCount:rows.reduce((n,r)=>n+r.requestCount,0),externalRequests:external.length,external}));
if(external.length)process.exitCode=1;
