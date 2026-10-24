import {describe,it,expect} from 'vitest';
import {curriculum,levels,lessonPrompt,completionFromScores} from './curriculum';
import {graphemes} from '../typing/graphemes';
describe('stage 5 course',()=>{
 it('has 124 ordered unique lessons across 10 levels',()=>{
  expect(levels.map(l=>l.count).reduce((a,b)=>a+b,0)).toBe(124);
  expect(curriculum).toHaveLength(124);
  expect(new Set(curriculum.map(l=>l.id)).size).toBe(124);
  expect(curriculum.map(l=>l.index)).toEqual(Array.from({length:124},(_,i)=>i+1));
 });
 for(const locale of ['ru','en'] as const)it(`has fully defined, unique original prompts in ${locale}`,()=>{
  const p=curriculum.map(l=>lessonPrompt(l,locale));
  expect(new Set(p.map(x=>x.text)).size).toBe(124);
  expect(p.every(x=>x.license==='original'&&graphemes(x.text).length>=30)).toBe(true);
 });
 it('does not reward premature manual finish',()=>{
  const lesson=curriculum[0],p=lessonPrompt(lesson,'ru');
  const record={promptId:p.id,summary:{accuracy:1,netWpm:25,typedCharacters:1}};
  expect(completionFromScores([record],'ru').size).toBe(0);
  expect(completionFromScores([{...record,summary:{...record.summary,typedCharacters:graphemes(p.text).length}}],'ru').size).toBe(1);
 });
});
