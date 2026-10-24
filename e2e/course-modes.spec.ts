import {test,expect} from '@playwright/test';
test('course navigator opens a specific lesson',async({page})=>{
 await page.goto('/#/academy');
 await expect(page.getByText('124 доступных упражнения', {exact:false})).toBeVisible();
 await page.locator('a[href*="lesson=L01-01"]').first().click();
 await expect(page.locator('#practice-mode')).toHaveValue('lesson');
 await expect(page.getByLabel('Введите текст, показанный выше')).toBeVisible();
});
test('daily challenge mode can be selected',async({page})=>{
 await page.goto('/#/practice');
 await page.getByLabel('Режим').selectOption('daily');
 await expect(page.getByText('Единый текст дня', {exact:false})).toBeVisible();
});
test('custom text can be prepared locally',async({page})=>{
 await page.goto('/#/practice');
 await page.getByLabel('Режим').selectOption('custom');
 await page.locator('#custom-text').fill('A careful local test.');
 await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
 await expect(page.locator('.target-text')).toContainText('A careful local test.');
});
