import {test,expect} from '@playwright/test';

test('the profile has no fabricated achievements and saves a local alias',async({page})=>{
 await page.goto('/#/profile');
 await expect(page.getByText('0 / 8',{exact:true})).toBeVisible();
 await page.getByLabel('Псевдоним',{exact:true}).fill('QuietFox');
 await page.getByRole('button',{name:'Сохранить имя'}).click();
 await expect(page.getByRole('status').filter({hasText:'Псевдоним сохранён только на устройстве.'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'QuietFox'})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{name:'QuietFox'})).toBeVisible();
});

test('offline bots show progress only once a human starts',async({page})=>{
 await page.goto('/#/race');
 await expect(page.getByText('OFFLINE BOTS')).toBeVisible();
 await expect(page.locator('.race-lane')).toHaveCount(4);
 await expect(page.locator('.race-lane').nth(1)).toContainText('0%');
 await page.locator('#race-input').fill('а');
 await expect(page.getByText('Гонка идёт…')).toBeVisible();
});

test('classroom assignment export and import is local-only',async({page})=>{
 await page.goto('/#/classroom');
 await page.getByRole('button',{name:'Я преподаватель'}).click();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Скачать задание JSON'}).click();
 const downloaded=await downloadPromise;
 expect(downloaded.suggestedFilename()).toContain('tykora-assignment-');
 const filename=await downloaded.path();
 expect(filename).not.toBeNull();
 await page.getByRole('button',{name:'Я ученик'}).click();
 await page.locator('input[type=file]').last().setInputFiles(filename!);
 await expect(page.getByText('Урок точного набора',{exact:true})).toBeVisible();
});

test('invalid classroom assignment is rejected without rendering untrusted data',async({page})=>{
 await page.goto('/#/classroom');
 await page.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"kind":"bad"}')});
 await expect(page.getByRole('status')).toContainText('Файл не является заданием');
});
