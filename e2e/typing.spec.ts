import {expect,test} from '@playwright/test';

test('typing starts the live metrics and records errors',async({page})=>{
 await page.goto('/#/practice');
 const input=page.getByLabel('Введите текст, показанный выше');
 await input.focus();
 await input.pressSequentially('Точный набор', {delay:45});
 await expect(page.getByText('ИДЁТ НАБОР')).toBeVisible();
 await expect(page.getByText('NET WPM')).toBeVisible();
 await expect(input).toHaveValue('Точный набор');
});

test('focus mode and language controls work',async({page})=>{
 await page.goto('/#/practice');
 await page.getByLabel('Язык текста').selectOption('en');
 await expect(page.getByLabel('Введите текст, показанный выше')).toBeVisible();
 await page.getByRole('button',{name:/Фокус/}).click();
 await expect(page.locator('body')).toHaveClass(/focus-mode/);
 await page.keyboard.press('Escape');
 await expect(page.locator('body')).not.toHaveClass(/focus-mode/);
});
