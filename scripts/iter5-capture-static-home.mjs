import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
try{
 await page.goto('http://127.0.0.1:4174/#/');
 await page.getByRole('heading',{name:'Каждое нажатие — шаг вперёд.'}).waitFor();
 await page.waitForTimeout(400);
 const markup=await page.locator('#root').evaluate(el=>el.innerHTML);
 if(!markup.includes('Каждое нажатие — шаг вперёд.')||markup.length<2000)throw Error('Unexpected initial Home DOM');
 if(/<script\b|<iframe\b/i.test(markup))throw Error('Unsafe DOM in generated static markup');
 mkdirSync('performance-artifacts/iter5-static-home',{recursive:true});
 writeFileSync('performance-artifacts/iter5-static-home/fragment.html',markup);
 const summary={sha:process.env.GITHUB_SHA,browser:browser.version(),bytes:Buffer.byteLength(markup),sha256:createHash('sha256').update(markup).digest('hex'),homeH1:await page.locator('main h1').first().textContent(),note:'Captured a clean empty-session Home DOM; prospective hydrateRoot baseline only, not a tested implementation.'};
 writeFileSync('performance-artifacts/iter5-static-home/summary.json',JSON.stringify(summary,null,2));
 console.log('TYKORA_STATIC_HOME '+JSON.stringify(summary));
}finally{await browser.close();}
