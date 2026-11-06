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
   // Never capture the previous route's heading while a lazy route loads.
   // Keep exactly the same user-facing content, themes and golden threshold.
   if(name==='practice')await expect(page.locator('#practice-mode')).toBeVisible();
   else if(name==='themes')await expect(page.locator('.themes-grid')).toBeVisible();
   else if(name==='home')await expect(page.getByRole('heading',{level:1,name:'Каждое нажатие — шаг вперёд.'})).toBeVisible();
   else await expect(page.getByRole('heading',{level:1,name:'Хороший ритм. Чёткий результат.'})).toBeVisible();
   for(const width of [320,768,1440]){
    await page.setViewportSize({width,height:900});
    // Fonts, theme hydration and responsive reflow must settle before a
    // golden comparison. This is not a threshold relaxation or rebaseline.
    await page.waitForLoadState('networkidle');
    await page.evaluate(async()=>{
     await document.fonts.ready;
     await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    });
    // All desktop themes must place the actual chrome/sidebar at document top.\n    // The historical Contrast Dark golden inadvertently captured it at y≈200.\n    if(width===1440)await expect.poll(async()=>{\n     const box=await page.locator('.sidebar').boundingBox();\n     return box===null?null:Math.round(box.y);\n    }).toBe(0);\n    const geometry=await page.locator('main').evaluate(el=>({
     height:el.getBoundingClientRect().height,
     documentHeight:document.documentElement.scrollHeight,
     locale:document.documentElement.lang,
     h1:el.querySelector('h1')?.textContent??null
    }));
    console.log('TYKORA_VISUAL_GEOMETRY '+JSON.stringify({theme,name,width,...geometry}));
    await page.screenshot({path:dir+'/'+theme.replaceAll(' ','_')+'-'+name+'-'+width+'.png',animations:'disabled',fullPage:true});
   }
  }
  await page.evaluate(()=>{location.hash='#/themes';});
  await expect(page.locator('.themes-grid')).toBeVisible();
 }
});
