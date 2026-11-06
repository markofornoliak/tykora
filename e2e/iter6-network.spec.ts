import {test,expect} from '@playwright/test';

for(const route of ['/', '/#/practice', '/#/profile'] as const){
 test('first load '+route+' makes zero third-party network requests without consent',async({page})=>{
  const foreign:string[]=[];
  const origin=new URL('http://127.0.0.1:4173/').origin;
  page.on('request',request=>{
   const uri=request.url();
   if(uri.startsWith('data:')||uri.startsWith('blob:'))return;
   try{
    if(new URL(uri).origin!==origin)foreign.push(uri);
   }catch{
    foreign.push(uri);
   }
  });
  await page.goto(route);
  if(route==='/#/practice')await expect(page.locator('#typing-input')).toBeVisible();
  if(route==='/#/profile')await expect(page.locator('#profile-alias')).toBeEnabled();
  if(route==='/')await expect(page.getByRole('heading',{name:/Каждое нажатие|Every keystroke/i})).toBeVisible();
  await page.waitForTimeout(500); // Include idle boot and SW registration; no extra clicks.
  expect(foreign,'unexpected off-origin requests from first-load flow').toEqual([]);
 });
}
