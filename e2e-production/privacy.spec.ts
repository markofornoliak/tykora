import {test,expect} from '@playwright/test';

/** Built-app HTTP(S) privacy check for the default typing path.
 * This does not prove all routes, disabled browser features, or WebRTC traffic.
 */
test('typing without opt-in sends no third-party HTTP(S) requests',async({page,context,baseURL})=>{
 const external:string[]=[];
 const outboundWrites:string[]=[];
 const appOrigin=new URL(baseURL!).origin;
 context.on('request',request=>{
  const url=request.url();
  if(/^https?:/i.test(url)&&new URL(url).origin!==appOrigin)external.push(url);
  if(/^https?:/i.test(url)&&!['GET','HEAD','OPTIONS'].includes(request.method()))outboundWrites.push(`${request.method()} ${url}`);
 });
 await page.goto('/#/practice');
 const input=page.locator('#typing-input');
 await expect(input).toBeVisible();
 await input.focus();
 await input.pressSequentially('Точный набор',{delay:10});
 await expect(input).toHaveValue('Точный набор');
 await page.goto('/#/profile');
 await expect(page.locator('#profile-alias')).toBeEnabled();
 await page.goto('/#/analytics');
 await expect(page.getByText('Прогресс, который можно объяснить.')).toBeVisible();
 expect(external,'Default local flows must not send HTTP requests to external domains').toEqual([]);
 expect(outboundWrites,'Default local flows must not send POST/PUT/PATCH/DELETE').toEqual([]);
});
