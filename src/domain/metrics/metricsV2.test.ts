import {describe,it,expect} from 'vitest';
import {createEngine,acceptInput,finishEngine} from '../typing/engine';
import {calculateScoreV2,activeElapsedMs,SCORING_VERSION_V2} from './metricsV2';
import {diagnostics} from '../content/prompts';
const target={...diagnostics.en,text:'abcdefghij'};
function paced(times:readonly number[],text=target.text){
 let state=createEngine({...target,text});
 for(let i=0;i<times.length;i++)state=acceptInput(state,text.slice(0,i+1),times[i]);
 return state;
}
describe('Scoring v2 — independently calculated reference cases',()=>{
 it('counts graphemes with five per word and correct-final CPM',()=>{
  const s=paced([1000,2000,3000,4000,5000,6000,7000,8000,9000,10000]);
  const m=calculateScoreV2(s,10000);
  // 10 characters in 9 active seconds: WPM = 10/5/(9/60) = 13.333...
  expect(m.rawWpm).toBe(13.3);
  expect(m.netWpm).toBe(13.3);
  expect(m.cpm).toBe(66.7);
  expect(m.activeDurationMs).toBe(9000);
  expect(m.durationMs).toBe(9000);
  expect(m.accuracy).toBe(1);
  expect(m.finalAccuracy).toBe(1);
  expect(m.scoringVersion).toBe(SCORING_VERSION_V2);
 });
 it('fully excludes a long pause from active time and latency',()=>{
  const s=paced([1000,2000,3000,4000,5000,10000,11000,12000,13000,14000]);
  const m=calculateScoreV2(s,14000);
  expect(m.durationMs).toBe(13000);
  expect(m.activeDurationMs).toBe(8000);
  expect(m.rawWpm).toBe(15);
  expect(m.medianIntervalMs).toBe(1000);
  expect(m.p90IntervalMs).toBe(1000);
 });
 it('does not fabricate speed for sparse or very short samples',()=>{
  expect(calculateScoreV2(createEngine(target),0).rawWpm).toBeNull();
  expect(calculateScoreV2(paced([1000]),1000).netWpm).toBeNull();
  expect(calculateScoreV2(paced([1000,1200,1400,1600,1800,2000,2200,2400,2600,2800]),2800).cpm).toBeNull();
 });
 it('corrected errors lower attempt accuracy without altering correct final count',()=>{
  let s=createEngine(target);
  s=acceptInput(s,'abx',1000);
  s=acceptInput(s,'ab',2000);
  s=acceptInput(s,'abcdefghij',5000);
  const m=calculateScoreV2(s,5000);
  expect(m.correctedErrors).toBe(1);
  expect(m.uncorrectedErrors).toBe(0);
  expect(m.correctedErrorRate).toBeGreaterThan(0);
  expect(m.accuracy).toBeLessThan(1);
  expect(m.finalAccuracy).toBe(1);
  expect(m.netWpm===null||m.rawWpm===null||m.netWpm<=m.rawWpm).toBe(true);
 });
 it('manual finish counts only entered content, not missing target tail',()=>{
  const s=finishEngine(acceptInput(createEngine(target),'abc',1000),4000);
  const m=calculateScoreV2(s,4000);
  expect(m.uncorrectedErrors).toBe(0);
  expect(m.finalAccuracy).toBe(1);
  expect(m.rawWpm).toBeNull();
 });
 it('keeps empty and timestamp edge cases finite',()=>{
  for(const now of [-1000,0,1,1e12]){
   const m=calculateScoreV2(createEngine(target),now);
   expect(m.rawWpm).toBeNull();
   expect(m.netWpm).toBeNull();
   expect(m.cpm).toBeNull();
   expect(Number.isNaN(m.accuracy)).toBe(false);
   expect(m.correctedErrorRate).toBe(0);
  }
 });
 it('basic randomized invariants are preserved',()=>{
  let seed=123456;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
  for(let sample=0;sample<200;sample++){
   const length=2+Math.floor(random()*9);
   let at=0;
   const times=Array.from({length},()=>at+=Math.floor(random()*3000));
   const s=paced(times);
   const m=calculateScoreV2(s,at);
   expect(m.accuracy).toBeGreaterThanOrEqual(0);
   expect(m.accuracy).toBeLessThanOrEqual(1);
   expect(m.consistency===null||(m.consistency>=0&&m.consistency<=1)).toBe(true);
   if(m.netWpm!==null&&m.rawWpm!==null)expect(m.netWpm).toBeLessThanOrEqual(m.rawWpm);
   expect(activeElapsedMs(s,at)).toBeGreaterThanOrEqual(0);
  }
 });
});
