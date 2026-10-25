import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes=['/','/practice','/academy','/analytics','/result','/themes','/race','/profile','/classroom'] as const;
for(const route of routes){
 test(`axe-core route audit: ${route}`,async({page})=>{
  await page.goto(`/#${route}`);
  await page.locator('main#main-content').waitFor();
  await page.waitForLoadState('networkidle');
  const heading=page.locator('main h1, main h2').first();
  await expect(heading).toBeVisible();
  for(const width of [320,768,1440]){
   await page.setViewportSize({width,height:900});
   await expect(heading).toBeVisible();
   const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
   const violations=report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target).slice(0,8)}));
   // Existing gate remains stricter than the requested serious/critical-only minimum.
   expect(violations,`WCAG axe issues in ${route} at ${width}px: ${JSON.stringify(violations)}`).toEqual([]);
  }
 });
}
