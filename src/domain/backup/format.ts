/** Portable TYKORA backup. No network, no executable payloads. */
export const BACKUP_FORMAT='tykora-local-backup' as const;
export const BACKUP_VERSION=1 as const;
export const MAX_BACKUP_BYTES=25*1024*1024;
export type TableName='settings'|'sessions'|'skills'|'plans'|'profiles';
export const TABLE_NAMES:readonly TableName[]=['settings','sessions','skills','plans','profiles'];
export type BackupRow=Record<string,unknown>;
export type BackupData={ [K in TableName]:BackupRow[] };
export interface PortableBackup {
 format:typeof BACKUP_FORMAT;
 version:typeof BACKUP_VERSION;
 exportedAt:string;
 data:BackupData;
}
function obj(x:unknown):x is Record<string,unknown>{return x!==null&&typeof x==='object'&&!Array.isArray(x);}
function str(x:unknown,max=250):x is string{return typeof x==='string'&&x.length>0&&x.length<=max;}
function finite(x:unknown):x is number{return typeof x==='number'&&Number.isFinite(x);}
function iso(x:unknown):x is string{return str(x,60)&&!Number.isNaN(Date.parse(x));}
function nonNeg(n:unknown):n is number{return finite(n)&&n>=0;}
function nullableNum(n:unknown):boolean{return n===null||nonNeg(n);}
function isScore(s:Record<string,unknown>):boolean{
 if(!obj(s.errorTypes))return false;
 const v2=s.scoringVersion==='tykora-2.0.0';
 const speed=['netWpm','rawWpm','cpm'];
 const validSpeed=speed.every(k=> (v2&&s[k]===null) || (nonNeg(s[k])&&(s[k] as number)<=2000));
 const validV2=!v2||(
  nonNeg(s.activeDurationMs)&&nonNeg(s.durationMs)&&s.activeDurationMs<=s.durationMs
  &&(s.finalAccuracy===null||(finite(s.finalAccuracy)&&s.finalAccuracy>=0&&s.finalAccuracy<=1))
  &&nonNeg(s.correctedErrorRate)&&nonNeg(s.uncorrectedErrorRate)
  &&nullableNum(s.p90IntervalMs)&&nullableNum(s.rhythmStability)
  &&finite(s.pauseThresholdMs)&&s.pauseThresholdMs>0
  &&(s.consistency===null||(finite(s.consistency)&&s.consistency>=0&&s.consistency<=1))
 );
 return validSpeed && validV2
 &&finite(s.accuracy)&&s.accuracy>=0&&s.accuracy<=1
 &&['durationMs','correctedErrors','uncorrectedErrors','typedCharacters','correctAttempts','totalAttempts','deletions'].every(k=>nonNeg(s[k]))
 &&['insertion','omission','substitution','transposition'].every(k=>nonNeg((s.errorTypes as Record<string,unknown>)[k]))
 &&nullableNum(s.consistency)&&nullableNum(s.medianIntervalMs)
 &&typeof s.eligibleForSkillUpdate==='boolean'&&str(s.scoringVersion,60);
}
function checkRow(table:TableName,v:unknown):v is BackupRow {
 if(!obj(v))return false;
 switch(table){
 case 'settings':return v.key==='app'&&obj(v.value)&&str(v.value.themeName,80)&&str(v.value.uiLocale,8)&&finite(v.value.textScale)&&v.value.textScale>=50&&v.value.textScale<=200;
 case 'sessions':return str(v.id,180)&&iso(v.endedAt)&&str(v.mode,60)&&str(v.locale,16)&&str(v.layoutId,80)&&str(v.promptId,250)&&v.schemaVersion===1&&obj(v.summary)&&isScore(v.summary);
 case 'skills':return str(v.id,500)&&str(v.layoutId,80)&&str(v.locale,16)&&['key','bigram','trigram'].includes(String(v.unit))&&str(v.sequence,30)&&finite(v.samples)&&v.samples>=0&&finite(v.successes)&&v.successes>=0&&finite(v.failures)&&v.failures>=0&&finite(v.mastery)&&v.mastery>=0&&v.mastery<=1&&finite(v.confidence)&&v.confidence>=0&&v.confidence<=1&&finite(v.dueAtMs)&&finite(v.lastAtMs)&&str(v.estimatorVersion,80)&&(v.meanIntervalMs===null||(finite(v.meanIntervalMs)&&v.meanIntervalMs>=0));
 case 'plans':return v.id==='current'&&finite(v.targetWpm)&&v.targetWpm>=20&&v.targetWpm<=200&&finite(v.horizonDays)&&Number.isInteger(v.horizonDays)&&v.horizonDays>=7&&v.horizonDays<=365&&[10,15,20].includes(Number(v.dailyMinutes))&&iso(v.createdAt)&&['ru','en'].includes(String(v.locale));
 case 'profiles':return v.id==='local'&&str(v.alias,32)&&iso(v.createdAt);
 }
}
export function parseBackup(raw:unknown):PortableBackup{
 if(!obj(raw)||raw.format!==BACKUP_FORMAT||raw.version!==BACKUP_VERSION||!iso(raw.exportedAt)||!obj(raw.data))throw new Error('Неподдерживаемый формат или версия резервной копии.');
 const data={} as BackupData;
 for(const table of TABLE_NAMES){
  const list=raw.data[table];
  if(!Array.isArray(list)||list.length>100_000)throw new Error(`Недопустимая коллекция: ${table}`);
  const seen=new Set<string>();
  for(const row of list){
   if(!checkRow(table,row))throw new Error(`Повреждённая запись: ${table}`);
   const key=String(row[table==='settings'?'key':'id']);
   if(seen.has(key))throw new Error(`Повторяющийся идентификатор: ${table}`);
   seen.add(key);
  }
  if((table==='settings'||table==='plans'||table==='profiles')&&list.length>1)throw new Error(`Лишние записи: ${table}`);
  data[table]=list as BackupRow[];
 }
 return {format:BACKUP_FORMAT,version:BACKUP_VERSION,exportedAt:raw.exportedAt,data};
}
export function makeBackup(data:BackupData,at=new Date().toISOString()):PortableBackup{
 return parseBackup({format:BACKUP_FORMAT,version:BACKUP_VERSION,exportedAt:at,data});
}
