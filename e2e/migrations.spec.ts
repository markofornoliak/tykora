import {expect,test} from '@playwright/test';

/**
 * Synthetic v1–v3 databases based on the committed Dexie schema declarations.
 * These are regression fixtures, NOT exports from an actual historical user profile.
 * Never delete or replace an existing user database as part of the application.
 */
for(const legacyVersion of [1,2,3]){
 test(`upgrades synthetic IndexedDB schema v${legacyVersion} without losing a session`,async({page})=>{
  // robots.txt shares the app origin but never boots React or opens Dexie.
  await page.goto('/robots.txt');
  await page.evaluate(async(version)=>{
   const dbName='tykora-db';
   await new Promise<void>((resolve,reject)=>{
    const request=indexedDB.deleteDatabase(dbName);
    request.onsuccess=()=>resolve();
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Legacy fixture deletion blocked'));
   });
   await new Promise<void>((resolve,reject)=>{
    const request=indexedDB.open(dbName,version);
    request.onupgradeneeded=()=>{
     const database=request.result;
     database.createObjectStore('settings',{keyPath:'key'});
     const sessions=database.createObjectStore('sessions',{keyPath:'id'});
     sessions.createIndex('endedAt','endedAt');
     sessions.createIndex('mode','mode');
     sessions.createIndex('layoutId','layoutId');
     const skills=database.createObjectStore('skills',{keyPath:'id'});
     skills.createIndex('layoutId','layoutId');
     if(version===1){
      skills.createIndex('unit','unit');
      skills.createIndex('updatedAt','updatedAt');
     }else{
      skills.createIndex('locale','locale');
      skills.createIndex('unit','unit');
      skills.createIndex('dueAtMs','dueAtMs');
     }
     if(version>=3)database.createObjectStore('plans',{keyPath:'id'});
     const tx=request.transaction!;
     tx.objectStore('sessions').put({
      id:`legacy-session-v${version}`,
      endedAt:'2026-10-24T10:00:00.000Z',
      mode:'words',locale:'en',layoutId:'en-qwerty',promptId:'legacy',
      schemaVersion:1,
      summary:{
       scoringVersion:'tykora-1.0.0',rawWpm:30,netWpm:28,cpm:140,
       accuracy:0.95,durationMs:60000,correctedErrors:1,uncorrectedErrors:0,
       typedCharacters:140,correctAttempts:140,totalAttempts:148,deletions:2,
       errorTypes:{insertion:0,omission:0,substitution:0,transposition:0},
       consistency:80,medianIntervalMs:200,eligibleForSkillUpdate:true
      }
     });
    };
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{request.result.close();resolve();};
   });
  },legacyVersion);

  await page.goto('/#/profile');
  await expect(page.getByRole('heading',{name:/прогресс принадлежит вам/i})).toBeVisible();
  // Wait for the profile repository to finish opening/upgrading Dexie.
  await expect(page.locator('#profile-alias')).toBeEnabled();
  const result=await page.evaluate(async(version)=>{
   const connection=await new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open('tykora-db');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
   });
   const saved=await new Promise<unknown>((resolve,reject)=>{
    const request=connection.transaction('sessions','readonly')
     .objectStore('sessions').get(`legacy-session-v${version}`);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
   });
   const currentVersion=connection.version;
   connection.close();
   return {saved,currentVersion};
  },legacyVersion);
  expect(result.currentVersion).toBe(4);
  expect(result.saved).toMatchObject({
   id:`legacy-session-v${legacyVersion}`,
   summary:{scoringVersion:'tykora-1.0.0',netWpm:28}
  });
 });
}
