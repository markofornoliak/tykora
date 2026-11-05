import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
const themes=['Daylight','Nightfall','Contrast Dark'] as const;
const routes=[['home','/'],['practice','/practice'],['themes','/themes'],['results','/result']] as const;
// Capture-only: no approved golden images exist yet. Screenshots are raw review
// evidence, not PASS visual-diff assertions.
test('screen captures across 3 themes × 3 viewports × 4 routes',async({page,browserName})=>{
 test.skip(process.env.TYKORA_VISUAL_CAPTURE!=='1','Dedicated visual evidence workflow only');
 test.skip(browserName!=='chromium','Chromium first-pass visual inventory');
 test.setTimeout(10*60*1000);
 const dir='performance-artifacts/iter5-visual';
 mkdirSync(dir,{recursive:true});
 await page.goto('/#/themes');
 for(const theme of themes){
  await page.getByRole('button',{name:theme,exact:true}).click();
  for(const [name,route] of routes){
   await page.evaluate(path=>{location.hash='#'+path;},route);
   await expect(page.locator('main h1,main h2').first()).toBeVisible();
   for(const width of [320,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.screenshot({path:dir+'/'+theme.replaceAll(' ','_')+'-'+name+'-'+width+'.png',animations:'disabled',fullPage:true});
   }
  }
  await page.evaluate(()=>{location.hash='#/themes';});
  await expect(page.locator('.themes-grid')).toBeVisible();
 }
});
