import {describe,it,expect} from 'vitest';
import {isWeakSkill,wilsonInterval,weakestSkills,skillId,type SkillNode,type SkillProfile} from './model';
import {generateDrill,wordPriority} from './generator';

function node(sequence:string,successes:number,samples:number,unit:'key'|'bigram'='bigram'):SkillNode {
 return {
  id:skillId('en-qwerty','en',unit,sequence),layoutId:'en-qwerty',locale:'en',unit,sequence,
  successes,failures:samples-successes,samples,
  mastery:(successes+2)/(samples+4),confidence:samples/(samples+12),
  dueAtMs:0,lastAtMs:0,meanIntervalMs:280,estimatorVersion:'tykora-beta-1'
 };
}
describe('Adaptive evidence thresholds',()=>{
 it('uses hand-checkable Wilson interval bounds, not a point estimate alone',()=>{
  const [lo,hi]=wilsonInterval(60,100);
  expect(lo).toBeCloseTo(.5020025868,8);
  expect(hi).toBeCloseTo(.6905987136,8);
  expect(wilsonInterval(0,0)).toEqual([0,1]);
 });
 it('does not mark rare combinations as weak even when all attempts failed',()=>{
  expect(isWeakSkill(node('th',0,2))).toBe(false);
  expect(isWeakSkill(node('th',0,19))).toBe(false);
 });
 it('identifies strong evidence of difficulty and does not flag accurate combinations',()=>{
  expect(isWeakSkill(node('th',60,100))).toBe(true);
  expect(isWeakSkill(node('th',97,100))).toBe(false);
  const weak=node('th',60,100),rare=node('zx',0,2),good=node('in',97,100);
  expect(weakestSkills({[weak.id]:weak,[rare.id]:rare,[good.id]:good},'en-qwerty','en').map(n=>n.sequence)).toEqual(['th']);
 });
 it('raises th priority with credible evidence while exploring unknown words',()=>{
  const bank=['there','think','other','weather','summer','place','music','baking','winter','lunar','quiet','safety'];
  const weak=node('th',40,100);
  const profile:SkillProfile={[weak.id]:weak};
  const settings={locale:'en',layoutId:'en-qwerty',seed:972,wordCount:6,nowMs:1};
  expect(wordPriority('there',profile,'en-qwerty','en',1)).toBeGreaterThan(wordPriority('there',{},'en-qwerty','en',1));
  const one=generateDrill(profile,bank,settings);
  expect(one).toBe(generateDrill(profile,bank,settings));
  expect(new Set(one.split(' ')).size).toBe(one.split(' ').length);
 });
});
