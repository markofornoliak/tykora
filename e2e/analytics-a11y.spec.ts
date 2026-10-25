import {expect,test} from '@playwright/test';

/** Exercise the real DOM typing → versioned scoring → IndexedDB → chart table flow.
 * No synthetic analytics fixtures, no mocked persistence, no loose timing assertions.
 */
test('the accessible analytics table reports the persisted scored typing session',async({page})=>{
 await page.goto('/#/practice');
 await page.getByLabel('Режим').selectOption('custom');
 await page.locator('#custom-text').fill('abcdefghijkl');
 await page.getByRole('button',{name:'Загрузить текст в упражнение'}).click();
 const input=page.getByLabel('Введите текст, показанный выше');
 await input.focus();
 // 12 graphemes over roughly 3.85 s: above the scorer's >=3 s and >=10 attempts gates.
 await input.pressSequentially('abcdefghijkl',{delay:350});
 await expect(page.getByRole('status').filter({hasText:'Результат сохранён только на этом устройстве.'})).toBeVisible();
 await page.goto('/#/analytics');
 const summary=page.getByText('Таблица результатов графика (1)');
 await expect(summary).toBeVisible();
 await summary.click();
 const table=page.getByRole('table',{name:/Локальные результаты по хронологии/});
 await expect(table).toBeVisible();
 await expect(table.getByRole('row')).toHaveCount(2);
 await expect(table).toContainText('tykora-2.0.0');
 await expect(table).toContainText('100.0%');
});
