import {describe,it,expect} from 'vitest';
import {dailyRoutine,validatePlan,type TrainingPlan} from './plan';
describe('Training plan',()=>{
 const plan:TrainingPlan={id:'current',targetWpm:80,horizonDays:60,dailyMinutes:15,createdAt:'2026-10-25T00:00:00Z',locale:'ru'};
 it('divides minutes without losing or inventing time',()=>{
  for(const minutes of [10,15,20] as const){const result=dailyRoutine({...plan,dailyMinutes:minutes});expect(result.reduce((a,b)=>a+b.minutes,0)).toBe(minutes);}
 });
 it('rejects impossible plan inputs',()=>expect(validatePlan({...plan,targetWpm:-3})).toBe(false));
});
