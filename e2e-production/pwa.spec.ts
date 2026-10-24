import {test,expect} from '@playwright/test';
test('built PWA installs service worker and keeps practice available offline',async({page,context})=>{
 await page.goto('/');
 await expect(page).toHaveTitle(/TYKORA/);
 await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
 await page.reload();
 await page.waitForFunction(()=>navigator.serviceWorker?.controller!==null,null,{timeout:20000});
 await context.setOffline(true);
 await page.goto('/#/practice');
 await expect(page.locator('#typing-input')).toBeVisible();
 await page.locator('#typing-input').fill('');
 await context.setOffline(false);
});
test('manifest is present with app icons',async({page})=>{
 await page.goto('/');
 const manifest=await page.evaluate(async()=>{
  const urls=document.querySelectorAll('link[rel="manifest"]');
  if(!urls.length)return null;
  return fetch((urls[0] as HTMLLinkElement).href).then(r=>r.json());
 });
 expect(manifest?.short_name).toBe('TYKORA');
 expect(manifest?.icons?.length).toBeGreaterThanOrEqual(2);
});
