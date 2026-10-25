import {db,type SettingRow} from '../persistence/db';
import type {SessionRecord} from '../../application/ports/ProgressRepository';
import type {SkillNode} from '../../domain/skills/model';
import type {TrainingPlan} from '../../domain/plans/plan';
import type {LocalProfile} from '../persistence/IndexedDbProfileRepository';
import {makeBackup,parseBackup,MAX_BACKUP_BYTES,type BackupData,type PortableBackup,type TableName} from '../../domain/backup/format';

/** Every table is stored as plain JSON. This file stays on the user's device. */
export async function exportLocalBackup():Promise<PortableBackup>{
 // One readonly transaction prevents an inconsistent export during concurrent writes.
 return db.transaction('r',db.settings,db.sessions,db.skills,db.plans,db.profiles,async()=>{
  const [settings,sessions,skills,plans,profiles]=await Promise.all([
   db.settings.toArray(),db.sessions.toArray(),db.skills.toArray(),db.plans.toArray(),db.profiles.toArray()
  ]);
  return makeBackup({settings,sessions,skills,plans,profiles} as unknown as BackupData);
 });
}
export async function importLocalBackup(raw:unknown,mode:'merge'|'replace'='merge'):Promise<Record<TableName,number>>{
 const backup=parseBackup(raw);
 const {settings,sessions,skills,plans,profiles}=backup.data;
 await db.transaction('rw',db.settings,db.sessions,db.skills,db.plans,db.profiles,async()=>{
  if(mode==='replace')await Promise.all([db.settings.clear(),db.sessions.clear(),db.skills.clear(),db.plans.clear(),db.profiles.clear()]);
  await db.settings.bulkPut(settings as unknown as SettingRow[]);
  await db.sessions.bulkPut(sessions as unknown as SessionRecord[]);
  await db.skills.bulkPut(skills as unknown as SkillNode[]);
  await db.plans.bulkPut(plans as unknown as TrainingPlan[]);
  await db.profiles.bulkPut(profiles as unknown as LocalProfile[]);
 });
 return {settings:settings.length,sessions:sessions.length,skills:skills.length,plans:plans.length,profiles:profiles.length};
}
export async function parseBackupFile(file:File):Promise<PortableBackup>{
 if(file.size>MAX_BACKUP_BYTES)throw new Error('Файл превышает 25 МБ.');
 return parseBackup(JSON.parse(await file.text()) as unknown);
}
