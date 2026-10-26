import {describe,it,expect} from 'vitest';
import fc from 'fast-check';
import {createEngine,acceptInput,finishEngine} from '../typing/engine';
import {calculateScoreV2} from './metricsV2';
import {diagnostics} from '../content/prompts';
import {graphemes} from '../typing/graphemes';

describe('fast-check: score invariants (fixed reproducible seed)',()=>{
 const alphabet=fc.constantFrom('a','b','c','Ж','🙂','e\u0301',' ');
 it('never reports net speed above raw speed, invalid accuracy, or nonfinite metrics',()=>{
  fc.assert(fc.property(
   fc.array(alphabet,{minLength:2,maxLength:95}),
   fc.array(fc.boolean(),{minLength:0,maxLength:95}),
   fc.integer({min:10,max:1500}),
   (chars,corrupt,interval)=>{
    const target=chars.join('');
    const original={...diagnostics.en,text:target};
    let state=createEngine(original);
    let candidate='';
    for(let i=0;i<graphemes(target).length;i++){
     const ch=graphemes(target)[i];
     candidate+=corrupt[i]&&ch!=='x'?'x':ch;
     state=acceptInput(state,candidate,1000+i*interval);
    }
    state=finishEngine(state,1000+chars.length*interval);
    const score=calculateScoreV2(state,state.endedAtMs!);
    expect(score.accuracy).toBeGreaterThanOrEqual(0);
    expect(score.accuracy).toBeLessThanOrEqual(1);
    expect(score.finalAccuracy===null||(score.finalAccuracy>=0&&score.finalAccuracy<=1)).toBe(true);
    expect(score.activeDurationMs).toBeGreaterThanOrEqual(0);
    expect(score.activeDurationMs).toBeLessThanOrEqual(score.durationMs);
    expect(score.netWpm===null||score.rawWpm===null||(score.netWpm<=score.rawWpm)).toBe(true);
    for(const v of [score.accuracy,score.finalAccuracy,score.rawWpm,score.netWpm,score.cpm,score.p90IntervalMs,score.rhythmStability,score.consistency]){
     expect(v===null||(Number.isFinite(v)&&!Number.isNaN(v))).toBe(true);
    }
   }
  ),{numRuns:250,seed:20261025});
 });
 it('is deterministic for identical input histories',()=>{
  fc.assert(fc.property(fc.array(alphabet,{minLength:2,maxLength:40}),chars=>{
   const target=chars.join('');
   const first=acceptInput(createEngine({...diagnostics.en,text:target}),target,16000);
   expect(calculateScoreV2(first,16000)).toEqual(calculateScoreV2(first,16000));
  }),{numRuns:100,seed:20261026});
 });
});
