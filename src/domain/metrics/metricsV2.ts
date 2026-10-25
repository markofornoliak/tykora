import {alignText} from './alignment';
import {elapsedMs,round,type Score} from './metrics';
import {targetGraphemes,typedGraphemes,type EngineState} from '../typing/engine';

/** New scoring semantics. Legacy tykora-1.0.0 scores are immutable. */
export const SCORING_VERSION_V2='tykora-2.0.0';
export const DEFAULT_PAUSE_THRESHOLD_MS=2000;

export interface ScoreV2 extends Omit<Score,'rawWpm'|'netWpm'|'cpm'> {
 readonly rawWpm:number|null;
 readonly netWpm:number|null;
 readonly cpm:number|null;
 readonly activeDurationMs:number;
 readonly finalAccuracy:number|null;
 readonly correctedErrorRate:number;
 readonly uncorrectedErrorRate:number;
 readonly p90IntervalMs:number|null;
 readonly rhythmStability:number|null;
 readonly pauseThresholdMs:number;
}

/** Active wall-time segments, with each gap above the pause threshold excluded in full. */
export function activeElapsedMs(state:EngineState,nowMs:number,pauseThresholdMs=DEFAULT_PAUSE_THRESHOLD_MS):number {
 if(state.startedAtMs===null)return 0;
 const end=Math.max(state.startedAtMs,state.endedAtMs??nowMs);
 const times=[state.startedAtMs,...state.attempts.map(x=>x.atMs),end];
 let active=0;
 for(let i=1;i<times.length;i++){
  const gap=times[i]-times[i-1];
  if(gap>0 && gap<=pauseThresholdMs) active+=gap;
 }
 return Math.min(active,end-state.startedAtMs);
}
const median=(sorted:readonly number[]):number|null=>{
 if(!sorted.length)return null;
 const m=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;
};
function percentile(sorted:readonly number[],p:number):number|null {
 if(!sorted.length)return null;
 return sorted[Math.ceil(p*sorted.length)-1];
}
function variation(values:readonly number[]):number|null{
 if(values.length<3)return null;
 const mean=values.reduce((a,b)=>a+b,0)/values.length;
 if(mean<=0)return null;
 const variance=values.reduce((a,v)=>a+(v-mean)**2,0)/values.length;
 return Math.max(0,Math.min(1,1-Math.sqrt(variance)/mean));
}
/** Typed grapheme attempts, not physical key presses; IME commits may contain many graphemes. */
export function calculateScoreV2(state:EngineState,nowMs:number,pauseThresholdMs=DEFAULT_PAUSE_THRESHOLD_MS):ScoreV2 {
 if(!Number.isFinite(pauseThresholdMs)||pauseThresholdMs<=0)throw new Error('Invalid pause threshold');
 const target=targetGraphemes(state.prompt),observed=typedGraphemes(state);
 const wall=elapsedMs(state,nowMs);
 const active=activeElapsedMs(state,nowMs,pauseThresholdMs);
 const finishedEarly=state.endedAtMs!==null && observed.length<target.length;
 const expected=finishedEarly?target.slice(0,observed.length).join(''):state.prompt.text;
 const comparison=state.endedAtMs!==null?alignText(expected,state.typed):{
  correct:observed.reduce((sum,char,i)=>sum+(char===target[i]?1:0),0),
  errors:[] as {kind:'insertion'|'omission'|'substitution'|'transposition'}[]
 };
 const totalAttempts=state.attempts.length;
 const correctAttempts=state.attempts.filter(a=>a.correct).length;
 const validSpeed=active>=3000&&totalAttempts>=10;
 const minutes=active/60000;
 const matched=Math.min(comparison.correct,totalAttempts,observed.length);
 const rawWpm=validSpeed?round(totalAttempts/5/minutes):null;
 const netWpm=validSpeed?round(matched/5/minutes):null;
 const cpm=validSpeed?round(matched/minutes):null;
 const intervals:number[]=[];
 const bucketCount=Math.floor(active/5000);
 const bucketCounts=Array.from({length:bucketCount},()=>0);
 let activePosition=0;
 let previous=state.startedAtMs;
 for(const attempt of state.attempts){
  if(previous!==null){
   const gap=attempt.atMs-previous;
   if(gap>0&&gap<=pauseThresholdMs){
    activePosition+=gap;
    if(previous!==state.startedAtMs || attempt.atMs!==state.startedAtMs)intervals.push(gap);
   }
  }
  previous=attempt.atMs;
  const bucket=Math.min(bucketCounts.length-1,Math.floor(activePosition/5000));
  if(bucket>=0&&bucket<bucketCounts.length)bucketCounts[bucket]++;
 }
 intervals.sort((a,b)=>a-b);
 const m=median(intervals),p90=percentile(intervals,.90);
 const lower=percentile(intervals,.25),upper=percentile(intervals,.75);
 const errors={insertion:0,omission:0,substitution:0,transposition:0};
 for(const error of comparison.errors) errors[error.kind]++;
 const denominator=finishedEarly?observed.length:target.length;
 return {
  scoringVersion:SCORING_VERSION_V2,rawWpm,netWpm,cpm,
  accuracy:totalAttempts?round(correctAttempts/totalAttempts,4):0,
  finalAccuracy:denominator?round(Math.min(1,matched/denominator),4):null,
  durationMs:wall,activeDurationMs:active,pauseThresholdMs,
  correctedErrors:state.correctedErrors,uncorrectedErrors:comparison.errors.length,
  correctedErrorRate:totalAttempts?round(100*state.correctedErrors/totalAttempts,2):0,
  uncorrectedErrorRate:totalAttempts?round(100*comparison.errors.length/totalAttempts,2):0,
  typedCharacters:observed.length,correctAttempts,totalAttempts,deletions:state.deletions,
  errorTypes:errors,consistency:variation(bucketCounts),
  medianIntervalMs:m,p90IntervalMs:p90,
  rhythmStability:m!==null&&m>0&&lower!==null&&upper!==null?round((upper-lower)/m,3):null,
  eligibleForSkillUpdate:state.endedAtMs!==null&&active>=8000&&totalAttempts>=20
 };
}
