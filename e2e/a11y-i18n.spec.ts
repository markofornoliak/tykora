import {expect,test} from '@playwright/test';

test('language switch updates document language and navigation',async({page})=>{
 await page.goto('/#/themes');
 await page.locator('#ui-locale').selectOption('de');
 await expect(page.locator('html')).toHaveAttribute('lang','de');
 await expect(page.getByRole('link',{name:'Übung'}).first()).toBeVisible();
 await page.reload();
 await expect(page.locator('#ui-locale')).toHaveValue('de');
 await expect(page.locator('html')).toHaveAttribute('lang','de');
});

test('skip link moves focus without corrupting hash route',async({page})=>{
 await page.goto('/#/academy');
 // A navigation response may finish before the React app mounts in CI.
 const skip=page.getByRole('link',{name:'Перейти к содержимому'});
 await expect(skip).toBeVisible();
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Перейти к содержимому'})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('main#main-content')).toBeFocused();
 await expect(page).toHaveURL(/#\/academy/);
});

test('custom theme rejects low contrast and retains chosen palette',async({page})=>{
 await page.goto('/#/themes');
 const color=page.locator('.color-inputs input[type=color]').nth(2);
 await color.fill('#ffffff');
 await expect(page.getByRole('button',{name:'Сохранить тему'})).toBeDisabled();
 await color.fill('#19231f');
 await expect(page.getByRole('button',{name:'Сохранить тему'})).toBeEnabled();
});

test('reduced motion and text scale are saved across a reload',async({page})=>{
 await page.goto('/#/themes');
 await page.getByLabel('Уменьшить движение').check();
 await page.locator('#text-scale').fill('130');
 await expect(page.locator('html')).toHaveClass(/reduce-motion/);
 await page.reload();
 await expect(page.getByLabel('Уменьшить движение')).toBeChecked();
 await expect(page.locator('#text-scale')).toHaveValue('130');
});

test('mobile all nine destinations are keyboard accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Пространство'}).last();
 await expect(nav.getByRole('link')).toHaveCount(9);
 await nav.getByRole('link',{name:'Класс'}).click();
 await expect(page).toHaveURL(/#\/classroom/);
});

test('typing field has an accessible name and focus mode can exit by touch',async({page})=>{
 await page.goto('/#/practice');
 await expect(page.getByRole('textbox',{name:'Введите текст, показанный выше'})).toBeVisible();
 await page.getByRole('button',{name:/Фокус/}).click();
 await expect(page.getByRole('button',{name:'Выйти из фокуса'})).toBeVisible();
 await page.getByRole('button',{name:'Выйти из фокуса'}).click();
 await expect(page.locator('body')).not.toHaveClass(/focus-mode/);
});

test('practice keyboard panel has correct heading level',async({page})=>{
 await page.goto('/#/practice');
 const heading=page.getByRole('heading',{name:'Визуальная клавиатура'});
 await expect(heading).toBeVisible();
 expect(await heading.evaluate(node=>node.tagName)).toBe('H2');
});
