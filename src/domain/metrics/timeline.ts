import type {EngineState} from '../typing/engine';
import {calculateScoreV2} from './metricsV2';
import type {SessionTimelineSample} from '../../application/ports/ProgressRepository';
/** Real snapshot from a live EngineState; never derive a simulated per-second curve
 * from the final summary. Does not persist characters or physical key codes. */
export function timelineSample(state:EngineState,atMs:number):SessionTimelineSample|null{
 if(state.startedAtMs===null||!Number.isFinite(atMs))return null;
 const second=Math.max(0,Math.floor((atMs-state.startedAtMs)/1000));
 const score=calculateScoreV2({...state,endedAtMs:null},atMs);
 return {second,netWpm:score.netWpm,accuracy:score.accuracy,attempts:state.attempts.length};
}
/** Bound to one observation per integer second; update last second if a
 * later subsecond snapshot arrives, preserving recorded chronological values. */
export function appendTimelineSample(samples:readonly SessionTimelineSample[],sample:SessionTimelineSample):SessionTimelineSample[]{
 const last=samples.at(-1);
 if(last&&sample.second<last.second)return [...samples];
 if(last?.second===sample.second)return [...samples.slice(0,-1),sample];
 return [...samples,sample];
}
