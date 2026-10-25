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

test('historical lesson success unlocks distinct review without awarding mastery',async({page})=>{
 await page.goto('/#/practice?lesson=L01-01&lang=ru');
 await expect(page.locator('#practice-mode')).toHaveValue('lesson');
 await expect(page.locator('.target-text')).toContainText('ф ы в а');
 const initialText=await page.locator('.target-text').innerText();
 const targetLength=[...initialText].length;
 expect(targetLength).toBeGreaterThanOrEqual(30);
 await page.evaluate(async(length)=>{
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{
   const req=indexedDB.open('tykora-db');
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction('sessions','readwrite');
   tx.objectStore('sessions').put({
    id:'historical-v08-first-pass',endedAt:'2026-10-23T00:00:00.000Z',
    mode:'lesson',locale:'ru',layoutId:'ru-jcuken',promptId:'course-L01-01-ru',schemaVersion:1,
    summary:{scoringVersion:'tykora-1.0.0',rawWpm:32,netWpm:30,cpm:150,
     accuracy:.98,durationMs:60000,correctedErrors:0,uncorrectedErrors:0,
     typedCharacters:length,correctAttempts:length,totalAttempts:length,deletions:0,
     errorTypes:{insertion:0,omission:0,substitution:0,transposition:0},
     consistency:80,medianIntervalMs:250,eligibleForSkillUpdate:true}
   });
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });db.close();
 },targetLength);
 await page.goto('/#/academy');
 const review=page.locator('a[href*="lesson=L01-01"][href*="review=1"]').first();
 await expect(review).toBeVisible();
 await expect(page.getByText('Ожидает контрольный текст').first()).toBeVisible();
 await review.click();
 await expect(page).toHaveURL(/review=1/);
 await expect(page.getByText(/Контрольный текст/).first()).toBeVisible();
 await expect.poll(()=>page.locator('.target-text').innerText()).not.toBe(initialText);
 const reviewText=await page.locator('.target-text').innerText();
 expect(reviewText).not.toContain('ф ы в а');
});

test('course review scans complete retained history beyond the old 4,000-session cap',async({page})=>{
 await page.goto('/#/practice?lesson=L01-01&lang=en');
 await expect(page.locator('#practice-mode')).toHaveValue('lesson');
 const initial=await page.locator('.target-text').innerText();
 const length=[...initial].length;
 expect(length).toBeGreaterThan(30);
 await page.evaluate(async(n)=>{
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{
   const req=indexedDB.open('tykora-db');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction('sessions','readwrite'),store=tx.objectStore('sessions');
   const summary={accuracy:.99,netWpm:30,rawWpm:30,typedCharacters:n};
   store.put({id:'very-old-course',endedAt:'2026-10-20T00:00:00.000Z',
    mode:'lesson',locale:'en',layoutId:'en-qwerty',schemaVersion:1,promptId:'course-L01-01-en',summary});
   for(let i=0;i<4001;i++)store.put({
    id:`newer-noise-${i}`,endedAt:'2026-10-24T00:00:00.000Z',
    mode:'words',locale:'en',layoutId:'en-qwerty',schemaVersion:1,promptId:'unrecognized-public-prompt',summary
   });
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });db.close();
 },length);
 await page.goto('/#/academy');
 await page.locator('#academy-language').selectOption('en'); // persisted course is English; Academy defaults to Russian
 const review=page.locator('a[href*="lesson=L01-01"][href*="review=1"]').first();
 await expect(review).toBeVisible();
 await review.click();
 await expect(page).toHaveURL(/review=1/);
 await expect(page.getByText(/Контрольный текст/).first()).toBeVisible();
});
