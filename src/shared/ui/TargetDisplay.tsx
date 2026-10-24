import {memo,useMemo} from 'react';
import {graphemes} from '../../domain/typing/graphemes';
/** Pure component: clock updates never require retokenizing a large prompt. */
export const TargetDisplay=memo(function TargetDisplay({target,typed,position,finished,blur}:{target:string;typed:string;position:number;finished:boolean;blur:boolean}){
 const targetChars=useMemo(()=>graphemes(target),[target]);const typedChars=useMemo(()=>graphemes(typed),[typed]);
 const start=Math.max(0,position-75),end=Math.min(targetChars.length,start+260);
 return <div className={`target-text ${blur?'blind-target':''}`} aria-hidden="true">
  {start>0&&<span className="muted">… </span>}
  {targetChars.slice(start,end).map((ch,k)=>{const i=start+k;return <span key={i} className={i<typedChars.length?(typedChars[i]===ch?'typed':'err'):(i===position&&!finished?'caret':'')}>{ch}</span>;})}
  {end<targetChars.length&&<span className="muted"> …</span>}
 </div>;
});
