import type { SessionRecord } from '../../application/ports/ProgressRepository';

export interface Achievement { id:string; title:string; detail:string; unlocked:boolean; value:number; threshold:number; }
export interface ProgressSummary { total:number; minutes:number; bestWpm:number; meanAccuracy:number; currentStreak:number; practiceDays:number; tier:string; achievements:Achievement[] }

/** Local date keys use the user's local timezone, not UTC boundaries. */
export function localDay(iso:string):string {
  const d=new Date(iso);
  if(!Number.isFinite(d.getTime()))return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function daysBefore(date:Date,offset:number):string{
 const d=new Date(date.getFullYear(),date.getMonth(),date.getDate()-offset,12);
 return localDay(d.toISOString());
}
export function summarizeProgress(sessions:readonly SessionRecord[],now=new Date()):ProgressSummary {
 const valid=sessions.filter(s=>s.summary.durationMs>0 && Number.isFinite(s.summary.netWpm));
 const bestWpm=valid.length?Math.max(...valid.map(s=>s.summary.netWpm)):0;
 const total=valid.length;
 const minutes=valid.reduce((a,s)=>a+s.summary.durationMs,0)/60000;
 const meanAccuracy=total?valid.reduce((a,s)=>a+s.summary.accuracy,0)/total:0;
 const practice=new Set(valid.map(s=>localDay(s.endedAt)).filter(Boolean));
 const active=practice.has(daysBefore(now,0))?0:practice.has(daysBefore(now,1))?1:-1;
 let currentStreak=0;
 if(active>=0){while(practice.has(daysBefore(now,active+currentStreak)))currentStreak++;}
 const tier=bestWpm>=120?'Мастер':bestWpm>=90?'Эксперт':bestWpm>=60?'Уверенный':bestWpm>=35?'Практик':'Начинающий';
 const count=(predicate:(s:SessionRecord)=>boolean)=>valid.filter(predicate).length;
 const metrics=[
  ['first','Первый шаг','Сохраните первый результат',total,1],
  ['five','Пять тренировок','Завершите 5 занятий',total,5],
  ['twenty','Постоянство','Завершите 20 занятий',total,20],
  ['precision','Точный набор','Достигните 98% точности в тесте от 20 секунд',count(s=>s.summary.accuracy>=0.98&&s.summary.durationMs>=20000),1],
  ['fifty','50 WPM','Достигните 50 WPM',bestWpm,50],
  ['eighty','80 WPM','Достигните 80 WPM',bestWpm,80],
  ['hour','Час практики','Наберите 60 минут за все занятия',minutes,60],
  ['rhythm','Ритм','Практикуйте 3 календарных дня подряд',currentStreak,3]
 ] as const;
 const achievements=metrics.map(([id,title,detail,value,threshold])=>({id,title,detail,value,threshold,unlocked:value>=threshold}));
 return {total,minutes,bestWpm,meanAccuracy,currentStreak,practiceDays:practice.size,tier,achievements};
}
