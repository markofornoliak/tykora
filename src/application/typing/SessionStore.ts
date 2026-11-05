import type {EngineState} from '../../domain/typing/engine';

/**
 * Ephemeral, out-of-React state for an active typing exercise.
 * Every accepted input notifies the lightweight visual adapter immediately.
 * React only observes immutable snapshots at most once per 250 ms, plus
 * start/end/reset transitions. No user text or raw events are persisted here.
 */
export function createSessionStore(initial:EngineState){
 let current=initial;
 let published=initial;
 let timer:ReturnType<typeof setTimeout>|null=null;
 const reactListeners=new Set<()=>void>();
 const visualListeners=new Set<()=>void>();
 const flush=()=>{
  if(timer!==null){clearTimeout(timer);timer=null;}
  if(published===current)return;
  published=current;
  for(const listener of reactListeners)listener();
 };
 const subscribe=(listener:()=>void)=>{
  reactListeners.add(listener);
  return ()=>{reactListeners.delete(listener);};
 };
 const subscribeVisual=(listener:()=>void)=>{
  visualListeners.add(listener);
  return ()=>{visualListeners.delete(listener);};
 };
 const update=(next:EngineState,force=false)=>{
  if(next===current)return;
  const previous=current;
  current=next;
  for(const listener of visualListeners)listener();
  if(force||previous.startedAtMs!==next.startedAtMs||previous.endedAtMs!==next.endedAtMs){
   flush();
  }else if(timer===null){
   timer=setTimeout(flush,250);
  }
 };
 const dispose=()=>{
  if(timer!==null){clearTimeout(timer);timer=null;}
  reactListeners.clear();
  visualListeners.clear();
 };
 return {
  get current(){return current;},
  getSnapshot:()=>published,
  subscribe,
  subscribeVisual,
  update,
  flush,
  dispose
 };
}
export type SessionStore=ReturnType<typeof createSessionStore>;
