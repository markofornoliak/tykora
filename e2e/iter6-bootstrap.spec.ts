import {test,expect} from '@playwright/test';

/** Deliberately stall the REAL boot chunk, not a mock application.
 * Guarantees the test exercises the pre-hydration window in all engines. */
for(const route of ['/', '/#/themes'] as const){
 test('safe navigation while bootstrap is unavailable: '+route,async({page})=>{
  let release:()=>void=()=>{};
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/assets/bootstrap-*.js',async intercepted=>{
   await gate;
   await intercepted.continue();
  });
  try{
   await page.goto(route,{waitUntil:'domcontentloaded'});
   if(route==='/'){
    const nav=page.getByRole('navigation',{name:'Пространство'}).last();
    await expect(nav.getByRole('link',{name:'Класс'})).toBeVisible();
    await nav.getByRole('link',{name:'Класс'}).click();
    await expect(page).toHaveURL(/#\/classroom/);
    release();
    await expect(page.getByRole('heading',{name:/Обучение без аккаунтов|Learning without accounts/i}).first()).toBeVisible();
   }else{
    // The HTML contains Home markup, but a deep-linked app must clear it
    // synchronously to avoid a visible/selectable control that cannot work.
    await expect(page.locator('#ui-locale')).toHaveCount(0);
    release();
    await expect(page.locator('#ui-locale')).toBeVisible();
    await page.locator('#ui-locale').selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang','en');
   }
  }finally{release();}
 });
}
