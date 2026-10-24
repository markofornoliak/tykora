export interface TrainingPlan {
 id:'current';targetWpm:number;horizonDays:number;dailyMinutes:10|15|20;
 createdAt:string;locale:'ru'|'en';
}
export interface PlanSegment {title:string;minutes:number;description:string;mode:'lesson'|'adaptive'|'words'|'time'}
export function validatePlan(p:TrainingPlan):boolean {
 return Number.isFinite(p.targetWpm)&&p.targetWpm>=20&&p.targetWpm<=200
  &&Number.isInteger(p.horizonDays)&&p.horizonDays>=7&&p.horizonDays<=365
  &&[10,15,20].includes(p.dailyMinutes)&&!Number.isNaN(Date.parse(p.createdAt));
}
/** Scheduling suggestion, not a scientifically validated progress guarantee. */
export function dailyRoutine(plan:TrainingPlan):readonly PlanSegment[] {
 if(!validatePlan(plan))throw new Error('Invalid training plan');
 const warmup=plan.dailyMinutes===10?2:3;
 const review=plan.dailyMinutes===20?3:2;
 const adaptive=Math.round((plan.dailyMinutes-warmup-review)*.55);
 const transfer=plan.dailyMinutes-warmup-review-adaptive;
 return [
  {title:'Разминка',description:'Спокойный набор знакомых сочетаний',minutes:warmup,mode:'lesson'},
  {title:'Слабые сочетания',description:'Адаптивное упражнение по вашей статистике',minutes:adaptive,mode:'adaptive'},
  {title:'Незнакомый текст',description:'Проверка переноса навыка',minutes:transfer,mode:'words'},
  {title:'Разбор',description:'Изучение ошибок и перерыв',minutes:review,mode:'time'}
 ];
}
