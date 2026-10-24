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
 await expect(page.getByText(/Импортировано \d+ занятий/i)).toBeVisible();
});
