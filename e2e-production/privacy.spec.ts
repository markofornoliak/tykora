import {test,expect} from '@playwright/test';

/** Built-app HTTP(S) privacy check for the default typing path.
 * This does not prove all routes, disabled browser features, or WebRTC traffic.
 */
test('typing without opt-in sends no third-party HTTP(S) requests',async({page,context,baseURL})=>{
 const external:string[]=[];
 const appOrigin=new URL(baseURL!).origin;
 context.on('request',request=>{
  const url=request.url();
  if(/^https?:/i.test(url)&&new URL(url).origin!==appOrigin)external.push(url);
 });
 await page.goto('/#/practice');
 const input=page.locator('#typing-input');
 await expect(input).toBeVisible();
 await input.focus();
 await input.pressSequentially('Точный набор',{delay:10});
 await expect(input).toHaveValue('Точный набор');
 await page.waitForTimeout(500);
 expect(external,'Default typing must not send HTTP requests to external domains').toEqual([]);
});
