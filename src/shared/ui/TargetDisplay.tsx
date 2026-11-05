import {memo,useLayoutEffect,useRef} from 'react';
import {graphemes} from '../../domain/typing/graphemes';
import {currentPosition,typedGraphemes} from '../../domain/typing/engine';
import type {SessionStore} from '../../application/typing/SessionStore';

type Run={start:number;style:'typed'|'err'|'caret'|'';text:string};
/** Legacy pure helper retained for deterministic comparisons and tests. */
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

/**
 * A bounded native DOM window, updated in rAF without reconciliation.
 * React never renders a glyph per keypress. The visual tree is aria-hidden;
 * the existing textarea and target-readable description remain accessible.
 */
export const TargetDisplay=memo(function TargetDisplay({target,store,blur}:{target:string;store:SessionStore;blur:boolean}){
 const rootRef=useRef<HTMLDivElement>(null);
 const probe=(typeof window!=='undefined'?(window as unknown as {__TYKORA_BENCHMARK__?:{targetRenders:number}}).__TYKORA_BENCHMARK__:undefined);
 if(probe)probe.targetRenders++;
 useLayoutEffect(()=>{
  const root=rootRef.current;
  if(!root)return;
  const chars=graphemes(target);
  let start=-1;
  let nodes:HTMLSpanElement[]=[];
  let frame:number|null=null;
  function redraw(){
   const state=store.current;
   const pos=currentPosition(state);
   const typed=typedGraphemes(state);
   const wantedStart=Math.max(0,Math.floor(pos/96)*96-96);
   if(start!==wantedStart){
    start=wantedStart;
    const end=Math.min(chars.length,start+288);
    const fragment=document.createDocumentFragment();
    nodes=[];
    if(start>0){
     const ellipsis=document.createElement('span');
     ellipsis.className='muted';ellipsis.textContent='… ';
     fragment.append(ellipsis);
    }
    for(let i=start;i<end;i++){
     const node=document.createElement('span');
     node.textContent=chars[i];
     nodes.push(node);fragment.append(node);
    }
    if(end<chars.length){
     const ellipsis=document.createElement('span');
     ellipsis.className='muted';ellipsis.textContent=' …';
     fragment.append(ellipsis);
    }
    root!.replaceChildren(fragment);
   }
   for(let j=0;j<nodes.length;j++){
    const i=start+j;
    const style=i<typed.length?(typed[i]===chars[i]?'typed':'err'):(i===pos&&state.endedAtMs===null?'caret':'');
    if(nodes[j].className!==style)nodes[j].className=style;
   }
  }
  function schedule(){
   if(frame!==null)return;
   frame=requestAnimationFrame(()=>{frame=null;redraw();});
  }
  redraw();
  const unsubscribe=store.subscribeVisual(schedule);
  return ()=>{unsubscribe();if(frame!==null)cancelAnimationFrame(frame);};
 },[target,store]);
 return <div ref={rootRef} className={`target-text${blur?' blind-target':''}`} aria-hidden="true" data-typing-window="bounded"/>;
});
