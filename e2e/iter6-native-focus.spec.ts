import {expect,test} from '@playwright/test';

for(const route of ['/#/home','/#/academy','/#/practice','/#/analytics','/#/profile'] as const){
 test('native skip and main remain stable across delayed hydration: '+route,async({page})=>{
  let release:()=>void=()=>{};
  let blocked=false;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/assets/bootstrap-*.js',async request=>{
   blocked=true;await gate;await request.continue();
  });
  await page.addInitScript(()=>{
   const state={main:false,chrome:false,mainNode:null as Element|null,skipNode:null as Element|null,h1Node:null as Element|null};
   (window as unknown as {__ITER6_FOCUS__?:typeof state}).__ITER6_FOCUS__=state;
   window.addEventListener('tykora:hydrated',()=>{state.main=true;});
   window.addEventListener('tykora:chrome-hydrated',()=>{state.chrome=true;});
  });
  try{
   await page.goto(route,{waitUntil:'domcontentloaded'});
   await expect.poll(()=>blocked,{timeout:15000}).toBe(true);
   const skip=page.locator('body > a[data-tykora-skip="1"]');
   const main=page.locator('main#main-content');
   await expect(skip).toHaveCount(1);
   await expect(main).toHaveCount(1);
   await expect(page.locator('main#main-content #root')).toHaveCount(1);
   await expect(page.locator('main#main-content #chrome-root')).toHaveCount(0);
   if(route==='/#/home'){
    await expect(page.getByRole('heading',{level:1,name:'Каждое нажатие — шаг вперёд.'})).toBeVisible();
   }else{
    await expect(page.locator('#root')).toBeHidden();
    await expect(page.locator('#chrome-root')).toBeHidden();
    await expect(main).toBeVisible();
   }
   await page.evaluate(()=>{
    const state=(window as unknown as {__ITER6_FOCUS__:{mainNode:Element|null;skipNode:Element|null;h1Node:Element|null}}).__ITER6_FOCUS__;
    state.mainNode=document.getElementById('main-content');
    state.skipNode=document.querySelector('[data-tykora-skip]');
    state.h1Node=document.querySelector('main h1');
   });
   await page.keyboard.press('Tab');
   await expect(skip).toBeFocused();
   release();
   await expect.poll(()=>page.evaluate(()=>{
    const x=(window as unknown as {__ITER6_FOCUS__:{main:boolean;chrome:boolean}}).__ITER6_FOCUS__;
    return x.main&&x.chrome;
   }),{timeout:15000}).toBe(true);
   await expect(page.locator('.app')).toBeVisible();
   await expect(skip).toBeFocused();
   await page.keyboard.press('Enter');
   await expect(main).toBeFocused();
   await expect(page).toHaveURL(new RegExp(route.replace('/#/','/#/')+'$'));
   await expect(page.locator('main h1')).toBeVisible();
   const after=await page.evaluate(()=>{
    const x=(window as unknown as {__ITER6_FOCUS__:{mainNode:Element|null;skipNode:Element|null;h1Node:Element|null}}).__ITER6_FOCUS__;
    return {mainStable:x.mainNode===document.getElementById('main-content'),
      skipStable:x.skipNode===document.querySelector('[data-tykora-skip]'),
      h1Stable:x.h1Node===document.querySelector('main h1'),
      visibleTitle:document.querySelector('main h1')?.textContent??null,
      path:window.location.hash};
   });
   expect(after.mainStable,'Native main must retain object identity').toBe(true);
   expect(after.skipStable,'Native skip link must retain object identity').toBe(true);
   if(route==='/#/home')expect(after.h1Stable,'Authentic Home H1 must retain its DOM identity').toBe(true);
   expect(after.path).toBe(route.slice(1));
   console.log('ITER6_NATIVE_FOCUS '+JSON.stringify({route,after}));
  }finally{release();}
 });
}
