import {test,expect} from '@playwright/test';
test('Home is visible before application JS; real React hydration preserves initial heading',async({page})=>{
 const failures:string[]=[];
 page.on('console',msg=>{if(msg.type()==='error'&&/hydration|mismatch|recoverable/i.test(msg.text()))failures.push(msg.text());});
 page.on('pageerror',err=>failures.push(err.message));
 await page.route('**/assets/index-*.js',async route=>{
  await new Promise(resolve=>setTimeout(resolve,700));
  await route.continue();
 });
 await page.goto('/#/',{waitUntil:'domcontentloaded'});
 const heading=page.getByRole('heading',{name:'Каждое нажатие — шаг вперёд.'});
 await expect(heading).toBeVisible();
 await expect(page.locator('#root')).toHaveAttribute('data-tykora-home-prerender','1');
 const original=await heading.evaluate(el=>{(window as unknown as {__TYKORA_PRERENDER_H1__?:Element}).__TYKORA_PRERENDER_H1__=el;return el.textContent;});
 expect(original).toContain('Каждое');
 await page.waitForLoadState('networkidle');
 await expect(page.getByRole('link',{name:/Практика/}).first()).toBeVisible();
 const sameNode=await heading.evaluate(el=>(window as unknown as {__TYKORA_PRERENDER_H1__?:Element}).__TYKORA_PRERENDER_H1__===el);
 expect(sameNode,'Hydration replaced the pre-rendered LCP node').toBe(true);
 expect(failures,'React reported a Home hydration mismatch').toEqual([]);
});
test('Deep link does not keep the Home prerender after React boots',async({page})=>{
 await page.goto('/#/practice');
 await expect(page.locator('#practice-mode')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Каждое нажатие — шаг вперёд.'})).toHaveCount(0);
});

test('Home prerender matches initial locale when browser language is English',async({browser})=>{
 const context=await browser.newContext({locale:'en-US',viewport:{width:1280,height:900}});
 try{
  const page=await context.newPage();
  const issues:string[]=[];
  page.on('console',message=>{if(message.type()==='error'&&/hydration|mismatch|recoverable/i.test(message.text()))issues.push(message.text());});
  await page.goto('/#/',{waitUntil:'networkidle'});
  await expect(page.getByRole('heading',{name:'Каждое нажатие — шаг вперёд.'})).toBeVisible();
  expect(issues).toEqual([]);
 }finally{await context.close();}
});
