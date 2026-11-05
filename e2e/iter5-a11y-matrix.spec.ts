import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['/','/practice','/academy','/analytics','/result','/themes','/race','/profile','/classroom'] as const;
const themes=['Daylight','Nightfall','Porcelain','Ink','Limestone','Moss','Terracotta','Ocean','Cobalt','Burgundy','Midnight','Forest','Graphite','Rosewood','Apricot','Copper','Plum','Cypress','Paper','Lagoon','Winter','Sandstone','Contrast Light','Contrast Dark'] as const;
// Deliberately isolated from default CI: comprehensive 9×24×3 axe sweep
// is resource intensive. A dedicated Actions job enables this environment.
test.skip(process.env.TYKORA_A11Y_FULL_MATRIX!=='1','Run in the dedicated full-palette CI job');
for(const route of routes){
 test('24-theme Chromium axe matrix: '+route,async({page,browserName})=>{
  test.setTimeout(15*60*1000);
  if(browserName!=='chromium')test.skip(true,'Chromium coverage here; 3-browser base route suite remains in default CI');
  await page.goto('/#/themes');
  for(const theme of themes){
   const btn=page.getByRole('button',{name:theme,exact:true});
   await btn.click();
   await expect(btn).toHaveAttribute('aria-pressed','true');
   await page.evaluate(target=>{location.hash='#'+target;},route);
   await expect(page.locator('main h1,main h2').first()).toBeVisible();
   for(const width of [320,768,1440]){
    await page.setViewportSize({width,height:900});
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    const errors=result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html})).slice(0,4)}));
    expect(errors,theme+' '+route+' '+width+'px '+JSON.stringify(errors)).toEqual([]);
   }
   await page.evaluate(()=>{location.hash='#/themes';});
   await expect(page.locator('.themes-grid')).toBeVisible();
  }
 });
}
