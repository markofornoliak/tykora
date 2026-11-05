import {test,expect} from '@playwright/test';
test('new local sessions retain real optional per-second summary and accessible table',async({page})=>{
 await page.goto('/#/practice');
 await page.getByLabel('Режим').selectOption('custom');
 await page.locator('#custom-text').fill('abcdefghijklmnopqrstuv');
 await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
 const input=page.locator('#typing-input');await input.focus();
 await input.pressSequentially('abcdefghijklmnopqrstuv',{delay:180});
 await expect(page.getByRole('status').filter({hasText:'Результат сохранён только на этом устройстве.'})).toBeVisible();
 await page.goto('/#/result');
 const details=page.getByText(/Таблица наблюдений по секундам/);
 await expect(details).toBeVisible();
 await details.click();
 await expect(page.getByRole('table',{name:/Фактические сохранённые интервальные значения/})).toBeVisible();
});
