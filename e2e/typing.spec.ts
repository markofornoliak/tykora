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

test('short practice stores a v2 result with unavailable speed, not fake zero',async({page})=>{
 await page.goto('/#/practice');
 const input=page.locator('#typing-input');
 await input.focus();
 await input.pressSequentially('Точ',{delay:40});
 await page.locator('.end-session').click();
 const resultButton=page.getByRole('button',{name:/Полный результат/});
 await expect(resultButton).toBeEnabled();
 await resultButton.click();
 await expect(page.locator('.share-large')).toHaveText('—');
 const record=await page.evaluate(async()=>{
  const connection=await new Promise<IDBDatabase>((resolve,reject)=>{
   const request=indexedDB.open('tykora-db');
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error);
  });
  const records=await new Promise<any[]>((resolve,reject)=>{
   const request=connection.transaction('sessions','readonly').objectStore('sessions').getAll();
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error);
  });
  connection.close();
  return records[records.length-1];
 });
 expect(record.summary.scoringVersion).toBe('tykora-2.0.0');
 expect(record.summary.netWpm).toBeNull();
 expect(record.summary.rawWpm).toBeNull();
});
