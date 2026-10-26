import {test,expect} from '@playwright/test';
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
