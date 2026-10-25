import {calculateScoreV2} from '../../domain/metrics/metricsV2';
import type {EngineState} from '../../domain/typing/engine';
interface ScoreRequest {session:EngineState;atMs:number}
const send=(payload:unknown)=>(self as unknown as {postMessage:(message:unknown)=>void}).postMessage(payload);
self.onmessage=(event:MessageEvent<ScoreRequest>)=>{
 try{
  const score=calculateScoreV2(event.data.session,event.data.atMs);
  send({score});
 }catch(error){send({error:error instanceof Error?error.message:'Unknown scoring error'});}
};
