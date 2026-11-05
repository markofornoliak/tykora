import {describe,it,expect} from 'vitest';
import {curriculum,lessonPrompt,lessonProgressFromScores} from './curriculum';
import {graphemes} from '../typing/graphemes';
import {lintLessonContent,overlapRatio} from './contentLint';
describe('versioned first-three lesson holdout content',()=>{
 it('four-gram similarity is below 10 percent with target character coverage',()=>{
  expect(lintLessonContent()).toEqual([]);
  for(const language of ['ru','en'] as const)for(const l of curriculum.slice(0,3)){
   const p=lessonPrompt(l,language),r=lessonPrompt(l,language,undefined,'review');
   expect(overlapRatio(p.text,r.text)).toBeLessThan(.10);
   expect(r.id).toBe('course-'+l.id+'-'+language+'-review-v2');
  }
 });
 it('legacy review IDs still accept their original historical length',()=>{
  const l=curriculum[0],locale='en';
  const focus=l.focusEn;
  const rp=(v:string,n:number)=>Array.from({length:n},(_,i)=>v+(i%3===2?' .':'')).join(' ').replace(/ \./g,'.');
  const legacy=rp(focus.split(' ').reverse().join(' '),4)+' '+rp(focus,2);
  const first={id:'first',promptId:lessonPrompt(l,locale).id,endedAt:'2026-01-01T00:00:00Z',summary:{accuracy:1,netWpm:40,typedCharacters:graphemes(lessonPrompt(l,locale).text).length}};
  const second={id:'second',promptId:'course-'+l.id+'-'+locale+'-review',endedAt:'2026-01-01T02:10:00Z',summary:{accuracy:1,netWpm:40,typedCharacters:graphemes(legacy).length}};
  expect(lessonProgressFromScores([first,second],locale).get(l.id)?.mastered).toBe(true);
  expect(lessonProgressFromScores([first,{...second,summary:{...second.summary,typedCharacters:2}}],locale).get(l.id)?.mastered).toBe(false);
 });
});
