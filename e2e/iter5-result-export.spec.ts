import {test,expect} from '@playwright/test';
test('result PNG is generated offline after a real local session',async({page})=>{
 await page.goto('/#/practice');
 const input=page.locator('#typing-input');
 await input.focus();
 await input.pressSequentially('Точный',{delay:35});
 await page.locator('.end-session').click();
 const results=page.getByRole('button',{name:/Полный результат/});
 await expect(results).toBeEnabled();
 await results.click();
 const png=page.getByRole('button',{name:/PNG-карточку/});
 await expect(png).toBeVisible();
 const downloadPromise=page.waitForEvent('download');
 await png.click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('tykora-result.png');
});
