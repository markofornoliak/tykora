import {expect,test} from '@playwright/test';

for(const route of ['/#/academy','/#/themes'] as const){
 test('deep link keeps stale Home inaccessible until real route loads: '+route,async({page})=>{
  let release:()=>void=()=>{};
  let wasBlocked=false;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/assets/index-*.js',async request=>{
   wasBlocked=true;
   await gate;
   await request.continue();
  });
  try{
   // Module scripts delay DOMContentLoaded. Commit returns while the
   // production entry request is still deliberately blocked.
   await page.goto(route,{waitUntil:'commit'});
   await expect.poll(()=>wasBlocked,{message:'Production entry JS request must be blocked'}).toBe(true);
   await expect(page.locator('html')).toHaveAttribute('data-tykora-deep-link','1');
   await expect(page.locator('.app')).toBeHidden();
   await expect(page.locator('body > .skip-link')).toHaveCount(1);
   await expect(page.getByRole('link',{name:'Перейти к содержимому'})).toBeVisible();
   // Load the exact same actual production code; do not mock the app.
   release();
   const skip=page.getByRole('link',{name:'Перейти к содержимому'});
   await expect(skip).toBeVisible();
   await expect(page.locator('#root')).not.toHaveAttribute('data-tykora-home-prerender','1');
   await page.keyboard.press('Tab');
   await expect(skip).toBeFocused();
   await page.keyboard.press('Enter');
   await expect(page.locator('main#main-content')).toBeFocused();
   expect(new URL(page.url()).hash).toBe(route.slice(1));
  }finally{release();}
 });
}
