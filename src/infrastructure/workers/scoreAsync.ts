import {calculateScoreV2,type ScoreV2} from '../../domain/metrics/metricsV2';
import type {EngineState} from '../../domain/typing/engine';
/** Heavy final alignment runs away from the keystroke/render thread when possible. */
export function scoreAsync(session:EngineState,atMs:number):Promise<ScoreV2>{
 if(typeof Worker==='undefined')return Promise.resolve().then(()=>calculateScoreV2(session,atMs));
 return new Promise((resolve,reject)=>{
  let worker:Worker;
  try{worker=new Worker(new URL('./score.worker.ts',import.meta.url),{type:'module'});}catch{resolve(calculateScoreV2(session,atMs));return;}
  worker.onmessage=(event:MessageEvent<{score?:ScoreV2;error?:string}>)=>{
   worker.terminate();
   if(event.data.error)reject(new Error(event.data.error));
   else if(event.data.score)resolve(event.data.score);
   else reject(new Error('Scoring worker returned an empty result'));
  };
  worker.onerror=()=>{worker.terminate();try{resolve(calculateScoreV2(session,atMs));}catch(error){reject(error);}};
  worker.postMessage({session,atMs});
 });
}
