import type { EngineState } from '../typing/engine';
import { graphemes } from '../typing/graphemes';
import { calculateScore } from '../metrics/metrics';

export const ESTIMATOR_VERSION='tykora-beta-1';
export type Unit='key'|'bigram'|'trigram';
export interface SkillNode {
  id:string;
  layoutId:string;
  locale:string;
  unit:Unit;
  sequence:string;
  successes:number;
  failures:number;
  samples:number;
  mastery:number;
  confidence:number;
  dueAtMs:number;
  lastAtMs:number;
  meanIntervalMs:number|null;
  estimatorVersion:string;
}
export type SkillProfile = Record<string,SkillNode>;
export const skillId=(layoutId:string,locale:string,unit:Unit,seq:string)=>JSON.stringify([layoutId,locale,unit,seq]);
function makeNode(layoutId:string,locale:string,unit:Unit,sequence:string):SkillNode {
  return {id:skillId(layoutId,locale,unit,sequence),layoutId,locale,unit,sequence,
    successes:0,failures:0,samples:0,mastery:0.5,confidence:0,dueAtMs:0,lastAtMs:0,meanIntervalMs:null,estimatorVersion:ESTIMATOR_VERSION};
}
function review(node:SkillNode,success:boolean,atMs:number,intervalMs:number|null):SkillNode {
  const successes=node.successes+(success?1:0), failures=node.failures+(success?0:1), samples=successes+failures;
  // Beta(2,2): avoids overestimating a rarely observed key/sequence.
  const mastery=(successes+2)/(samples+4);
  const confidence=samples/(samples+12);
  const spacing=success ? (samples>=12 && mastery>0.85? 7:mastery>0.7?3:1)*86_400_000 : 10*60_000;
  const validInterval=intervalMs!==null && intervalMs>0 && intervalMs<5000;
  const meanIntervalMs=validInterval ? (node.meanIntervalMs===null ? intervalMs : node.meanIntervalMs*0.75+intervalMs*0.25):node.meanIntervalMs;
  return {...node,successes,failures,samples,mastery,confidence,dueAtMs:atMs+spacing,lastAtMs:atMs,meanIntervalMs};
}

/** Updates are only applied to completed, sufficiently long human-typed sessions.
 * Uncorrected errors are handled in-key; corrected attempts are not silently discarded.
 * 'Finger correctness' is not inferred: a browser cannot tell which finger was used.
 */
export function updateSkillProfile(profile:SkillProfile,state:EngineState, nowWallMs:number):SkillProfile {
  const score=calculateScore(state,state.endedAtMs??(state.startedAtMs??0));
  if(!score.eligibleForSkillUpdate) return profile;
  const next={...profile};
  const {layoutId,locale,text}=state.prompt;
  const target=graphemes(text);
  let previousAt:number|null=null;
  const seen:string[]=[];
  for(const a of state.attempts){
    if (a.char===' ' || a.char==='\n') { seen.length=0; previousAt=a.atMs; continue; }
    const expected=target[a.position];
    const success=a.correct && expected===a.char;
    const interval=previousAt===null?null:a.atMs-previousAt;
    previousAt=a.atMs;
    if (!expected) {seen.length=0;continue;}
    // Learn intended character, even when the user hit a wrong key.
    const id=skillId(layoutId,locale,'key',expected);
    next[id]=review(next[id]??makeNode(layoutId,locale,'key',expected),success,nowWallMs,interval);
    if(!success){
      for(const size of [2,3] as const){
        if(seen.length<size-1)continue;
        const sequence=[...seen.slice(1-size),expected].join('');
        const unit=size===2?'bigram':'trigram';
        const key=skillId(layoutId,locale,unit,sequence);
        next[key]=review(next[key]??makeNode(layoutId,locale,unit,sequence),false,nowWallMs,interval);
      }
      seen.length=0;continue;
    }
    seen.push(expected);
    if(seen.length>3)seen.shift();
    for(const size of [2,3] as const){
      if(seen.length<size)continue;
      const sequence=seen.slice(-size).join('');const unit=size===2?'bigram':'trigram';
      const key=skillId(layoutId,locale,unit,sequence);
      next[key]=review(next[key]??makeNode(layoutId,locale,unit,sequence),true,nowWallMs,interval);
    }
  }
  return next;
}

/** A 95% Wilson binomial interval, without judging low-sample skills prematurely. */
export function wilsonInterval(successes:number,samples:number):readonly [number,number] {
 if(!Number.isFinite(samples)||!Number.isFinite(successes)||samples<=0||successes<0||successes>samples)return [0,1];
 const z=1.959963984540054;
 const proportion=successes/samples, z2=z*z;
 const denominator=1+z2/samples;
 const center=(proportion+z2/(2*samples))/denominator;
 const margin=(z/denominator)*Math.sqrt((proportion*(1-proportion)/samples)+(z2/(4*samples*samples)));
 return [Math.max(0,center-margin),Math.min(1,center+margin)];
}
export const MIN_CONFIDENT_SKILL_SAMPLES=20;
export const TARGET_SKILL_ACCURACY=0.95;
/** A problem requires evidence: the *entire* 95% CI lies below target accuracy. */
export function isWeakSkill(node:SkillNode):boolean {
 return node.samples>=MIN_CONFIDENT_SKILL_SAMPLES &&
  wilsonInterval(node.successes,node.samples)[1]<TARGET_SKILL_ACCURACY;
}
export function weakestSkills(profile:SkillProfile,layoutId:string,locale:string,count=6, nowMs=Date.now()):SkillNode[] {
  return Object.values(profile).filter(n=>n.layoutId===layoutId&&n.locale===locale&&isWeakSkill(n)).sort((a,b)=>{
    const score=(n:SkillNode)=> (1-n.mastery)*n.confidence + (n.dueAtMs<=nowMs?0.12:0);
    return score(b)-score(a) || b.samples-a.samples;
  }).slice(0,count);
}
