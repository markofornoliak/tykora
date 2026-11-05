import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('keyboard skip-link and typed-input focus are independently reachable',async({page,browserName})=>{
 await page.goto('/#/practice');
 // WebKit's default tab-navigation behavior varies by host settings; focus
 // the link explicitly there and still test keyboard activation via Enter.
 if(browserName==='webkit')await page.locator('.skip-link').focus();
 else await page.keyboard.press('Tab');
 await expect(page.locator('.skip-link')).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('main#main-content')).toBeFocused();
 const input=page.locator('#typing-input');
 await input.focus();
 await expect(input).toBeFocused();
 await input.pressSequentially('Точный',{delay:15});
 await expect(input).toHaveValue('Точный');
 await expect(page.locator('[data-typing-window="bounded"]')).toHaveAttribute('aria-hidden','true');
});

test('24 themes can be selected from keyboard without losing selected state',async({page})=>{
 await page.goto('/#/themes');
 const buttons=page.locator('.theme-choice');
 await expect(buttons).toHaveCount(24);
 for(let i=0;i<24;i++){
  const choice=buttons.nth(i);
  await choice.focus();
  await page.keyboard.press('Enter');
  await expect(choice).toHaveAttribute('aria-pressed','true');
  const props=await page.evaluate(()=>({
   text:getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
   ring:getComputedStyle(document.documentElement).getPropertyValue('--ring').trim(),
   border:getComputedStyle(document.documentElement).getPropertyValue('--border').trim()
  }));
  expect(props.text).toMatch(/^#[0-9a-f]{6}$/i);
  expect(props.ring).toMatch(/^#[0-9a-f]{6}$/i);
  expect(props.border).toMatch(/^#[0-9a-f]{6}$/i);
 }
});

test('reduced motion and forced colors retain visible focus affordance',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
 await page.goto('/#/practice');
 const input=page.locator('#typing-input');
 await input.focus();
 await expect(input).toBeFocused();
 const style=await input.evaluate(el=>getComputedStyle(el).outlineStyle);
 expect(style).not.toBe('none');
});

test('Nightfall at 320px: real browser button contrast must pass',async({page})=>{
 await page.setViewportSize({width:320,height:900});
 await page.goto('/#/themes');
 await page.getByRole('button',{name:'Nightfall',exact:true}).click();
 const button=page.getByRole('button',{name:/Сохранить|Save|сохранить/i}).first();
 const computed=await button.evaluate(el=>{
  const s=getComputedStyle(el);
  const root=getComputedStyle(document.documentElement);
  return {className:el.className,disabled:(el as HTMLButtonElement).disabled,
   color:s.color,background:s.backgroundColor,opacity:s.opacity,
   accent:root.getPropertyValue('--accent'),onAccent:root.getPropertyValue('--on-accent')};
 });
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 const issues=result.violations.filter(v=>v.id==='color-contrast').flatMap(v=>v.nodes.map(n=>({
  target:n.target,html:n.html,summary:n.failureSummary,any:n.any.map(x=>x.message)
 })));
 console.log('TYKORA_CONTRAST_DEBUG '+JSON.stringify({computed,issues}));
 expect(issues).toEqual([]);
});
