import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('backup is exported from profile and can be imported on the same device',async({page})=>{
 await page.goto('/#/profile');
 await expect(page.getByRole('heading',{name:/резервная копия/i})).toBeVisible();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Скачать резервную копию'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/^tykora-backup-.*\.json$/);
 const filepath=await download.path();
 expect(filepath).toBeTruthy();
 await page.locator('#backup-file').setInputFiles(filepath!);
 await expect(page.getByRole('status').filter({hasText:/^Импортировано \d+ занятий/i})).toBeVisible();
});

test('replace import creates a safety download and honors cancellation',async({page})=>{
 await page.goto('/#/profile');
 const exportEvent=page.waitForEvent('download');
 await page.getByRole('button',{name:'Скачать резервную копию'}).click();
 const exported=await exportEvent;
 const originalPath=await exported.path();
 expect(originalPath).toBeTruthy();

 await page.getByLabel('Режим импорта').selectOption('replace');
 const safetyDownload=page.waitForEvent('download');
 const dialogSeen=new Promise<void>((resolve,reject)=>{
  page.once('dialog',async dialog=>{
   try{
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('ЗАМЕНИТЬ');
    await dialog.dismiss();
    resolve();
   }catch(error){reject(error);}
  });
 });
 await page.locator('#backup-file').setInputFiles(originalPath!);
 const safety=await safetyDownload;
 expect(safety.suggestedFilename()).toMatch(/^tykora-before-replace-.*\.json$/);
 await dialogSeen;
 await expect(page.getByRole('status').filter({hasText:'Замена отменена. Исходные данные не изменены.'})).toBeVisible();
});

test('tampered CRC backup is rejected without overwriting the existing local profile',async({page})=>{
 await page.goto('/#/profile');
 const alias=page.locator('#profile-alias');
 await expect(alias).toBeEnabled();
 await alias.fill('IntegrityWitness');
 await page.getByRole('button',{name:'Сохранить имя'}).click();
 await expect(page.getByRole('status').filter({hasText:'Псевдоним сохранён'})).toBeVisible();
 const downloadEvent=page.waitForEvent('download');
 await page.getByRole('button',{name:'Скачать резервную копию'}).click();
 const exported=await downloadEvent;
 const path=await exported.path();
 expect(path).toBeTruthy();
 const parsed=JSON.parse(await readFile(path!,'utf8'));
 expect(parsed.checksumAlgorithm).toBe('crc32');
 expect(parsed.data.profiles[0].alias).toBe('IntegrityWitness');
 parsed.data.profiles[0].alias='TamperedAlias'; // Intentionally do NOT update the checksum.
 await page.locator('#backup-file').setInputFiles({
  name:'tampered.json',mimeType:'application/json',
  buffer:Buffer.from(JSON.stringify(parsed),'utf8')
 });
 await expect(page.getByRole('status').filter({hasText:'Контрольная сумма резервной копии не совпадает'})).toBeVisible();
 await page.reload();
 await expect(page.locator('#profile-alias')).toHaveValue('IntegrityWitness');
});

test('files larger than 25 MiB are rejected before parsing',async({page})=>{
 await page.goto('/#/profile');
 await expect(page.locator('#profile-alias')).toBeEnabled();
 await page.locator('#backup-file').setInputFiles({
  name:'oversize.json',mimeType:'application/json',
  buffer:Buffer.alloc(25*1024*1024+1,0x20)
 });
 await expect(page.getByRole('status').filter({hasText:'Файл превышает 25 МБ'})).toBeVisible();
});
