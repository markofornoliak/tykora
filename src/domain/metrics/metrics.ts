import type { EngineState } from '../typing/engine';
import { alignText } from './alignment';
import {targetGraphemes,typedGraphemes} from '../typing/engine';
import type { TypingSummary } from '../typing/contracts';

export const SCORING_VERSION = 'tykora-1.0.0';
export interface Score extends TypingSummary {
  readonly cpm: number;
  readonly typedCharacters: number;
  readonly correctAttempts: number;
  readonly totalAttempts: number;
  readonly deletions: number;
  readonly errorTypes: Readonly<Record<'insertion'|'omission'|'substitution'|'transposition',number>>;
  readonly consistency: number | null;
  readonly medianIntervalMs: number | null;
  readonly eligibleForSkillUpdate: boolean;
}
export const round = (v: number, digits=1):number => Number(v.toFixed(digits));
export function elapsedMs(state: EngineState, nowMs: number): number {
  if (state.startedAtMs === null) return 0;
  return Math.max(0, (state.endedAtMs ?? nowMs) - state.startedAtMs);
}
function std(values: number[]): number {
  const avg=values.reduce((a,b)=>a+b,0)/values.length;
  return Math.sqrt(values.reduce((a,v)=>a+(v-avg)**2,0)/values.length);
}
export function calculateScore(state: EngineState, nowMs: number): Score {
  const elapsed=elapsedMs(state,nowMs), minutes=Math.max(elapsed,1000)/60000;
  // Live measurements must stay O(n), not O(n*m) on every keystroke.
  const observed=typedGraphemes(state);
  const target=targetGraphemes(state.prompt);
  // Timed, Zen and Hardcore sessions may finish early. Do not count untyped
  // remaining words as omission errors: compare only the attempted prefix.
  const finishedEarly = state.endedAtMs !== null && observed.length < target.length;
  const comparisonTarget = finishedEarly ? target.slice(0,observed.length).join('') : state.prompt.text;
  const matched = state.endedAtMs !== null
    ? alignText(comparisonTarget,state.typed)
    : {correct:observed.reduce((sum,g,i)=>sum+(g===target[i]?1:0),0),errors:[]};
  const correctAttempts=state.attempts.filter(x=>x.correct).length;
  const attempts=state.attempts.length;
  // 'Raw WPM': all generated graphemes, even later corrected; not physical keydown count.
  const rawWpm=round(attempts/5/minutes);
  // 'Net WPM': matched final graphemes; corrected errors cost time rather than a permanent penalty.
  const netWpm=round(Math.min(matched.correct,attempts)/5/minutes);
  const errorTypes = { insertion:0, omission:0, substitution:0, transposition:0 };
  for(const e of matched.errors) errorTypes[e.kind]++;
  const intervals=state.attempts.slice(1).map((a,i)=>a.atMs-state.attempts[i].atMs).filter(n=>n>0 && n<5000).sort((a,b)=>a-b);
  const mid=Math.floor(intervals.length/2);
  const median=intervals.length?(intervals.length%2 ? intervals[mid] : (intervals[mid-1]+intervals[mid])/2):null;
  // Consistency: variability in full 5s buckets. Last incomplete bucket is excluded.
  const bucketCount=Math.floor(elapsed/5000);
  const buckets=Array.from({length:bucketCount},()=>0);
  for(const attempt of state.attempts) {
    const index=Math.floor((attempt.atMs-(state.startedAtMs ?? attempt.atMs))/5000);
    if(index>=0&&index<bucketCount) buckets[index]++;
  }
  const mean=buckets.length?buckets.reduce((a,b)=>a+b,0)/buckets.length:0;
  const consistency=buckets.length>=3&&mean>0?round(Math.max(0,100*(1-std(buckets)/mean))):null;
  return {
    rawWpm, netWpm, cpm:round(attempts/minutes), accuracy:attempts ? round(correctAttempts/attempts,4):0,
    durationMs:elapsed, correctedErrors:state.correctedErrors, uncorrectedErrors:matched.errors.length,
    scoringVersion:SCORING_VERSION, typedCharacters:observed.length,
    correctAttempts,totalAttempts:attempts,deletions:state.deletions,errorTypes,
    consistency,medianIntervalMs:median,
    eligibleForSkillUpdate:state.endedAtMs!==null && elapsed>=8000 && attempts>=20
  };
}
