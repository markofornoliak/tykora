import {memo,useMemo} from 'react';
import {graphemes} from '../../domain/typing/graphemes';
type Run={start:number;style:'typed'|'err'|'caret'|'';text:string};
/** Compress adjacent characters with the same visual class into a single text node. */
export function visibleRuns(targetChars:readonly string[],typedChars:readonly string[],position:number,finished:boolean):{start:number;end:number;runs:Run[]} {
 const start=Math.max(0,position-75),end=Math.min(targetChars.length,start+260);
 const runs:Run[]=[];
 for(let i=start;i<end;i++){
  const style=i<typedChars.length?(typedChars[i]===targetChars[i]?'typed':'err'):(i===position&&!finished?'caret':'');
  const previous=runs.at(-1);
  if(previous&&previous.style===style)previous.text+=targetChars[i];
  else runs.push({start:i,style,text:targetChars[i]});
 }
 return {start,end,runs};
}
/** Large prompts are represented by a compact, stable number of DOM text spans. */
export const TargetDisplay=memo(function TargetDisplay({target,typed,position,finished,blur}:{target:string;typed:string;position:number;finished:boolean;blur:boolean}){
 const probe=(typeof window!=='undefined'?(window as unknown as {__TYKORA_BENCHMARK__?:{practiceRenders:number;targetRenders:number}}).__TYKORA_BENCHMARK__:undefined);
 if(probe)probe.targetRenders++;
 const targetChars=useMemo(()=>graphemes(target),[target]);
 const typedChars=useMemo(()=>graphemes(typed),[typed]);
 const {start,end,runs}=visibleRuns(targetChars,typedChars,position,finished);
 return <div className={`target-text ${blur?'blind-target':''}`} aria-hidden="true">
  {start>0&&<span className="muted">… </span>}
  {runs.map(run=><span key={run.start} className={run.style}>{run.text}</span>)}
  {end<targetChars.length&&<span className="muted"> …</span>}
 </div>;
});
