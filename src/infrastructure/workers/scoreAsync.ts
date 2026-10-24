import {calculateScore,type Score} from '../../domain/metrics/metrics';
import type {EngineState} from '../../domain/typing/engine';
/** Heavy final alignment runs away from the keystroke/render thread when possible. */
export function scoreAsync(session:EngineState,atMs:number):Promise<Score>{
 if(typeof Worker==='undefined')return Promise.resolve().then(()=>calculateScore(session,atMs));
 return new Promise((resolve,reject)=>{
  let worker:Worker;
  try{worker=new Worker(new URL('./score.worker.ts',import.meta.url),{type:'module'});}catch{resolve(calculateScore(session,atMs));return;}
  worker.onmessage=(event:MessageEvent<{score?:Score;error?:string}>)=>{
   worker.terminate();
   if(event.data.error)reject(new Error(event.data.error));
   else if(event.data.score)resolve(event.data.score);
   else reject(new Error('Scoring worker returned an empty result'));
  };
  worker.onerror=()=>{worker.terminate();try{resolve(calculateScore(session,atMs));}catch(error){reject(error);}};
  worker.postMessage({session,atMs});
 });
}
