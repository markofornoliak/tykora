import {describe,it,expect} from 'vitest';
import {curriculum,lessonPrompt,lessonProgressFromScores} from './curriculum';
import {graphemes} from '../typing/graphemes';
import {lintLessonContent,overlapRatio} from './contentLint';
describe('versioned full-curriculum holdout content',()=>{
 it('four-gram similarity is below 10 percent with target character coverage',()=>{
  expect(lintLessonContent()).toEqual([]);
  for(const language of ['ru','en'] as const)for(const l of curriculum){
   const p=lessonPrompt(l,language),r=lessonPrompt(l,language,undefined,'review');
   expect(overlapRatio(p.text,r.text)).toBeLessThan(.10);
   expect(r.id).toBe('course-'+l.id+'-'+language+(l.index<=3?'-review-v2':'-review-v3'));
   expect(graphemes(r.text).length).toBeGreaterThanOrEqual(30);
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

 it('keeps old non-versioned review IDs and lengths valid after the v3 upgrade',()=>{
  const lesson=curriculum[3],locale='en';
  const focus=lesson.focusEn,reversed=focus.split(' ').reverse().join(' ');
  const repeated=(value:string,n:number)=>Array.from({length:n},(_,i)=>value+(i%3===2?' .':'')).join(' ').replace(/ \./g,'.');
  const original= repeated(reversed,4)+' '+repeated(focus,2);
  const practice=lessonPrompt(lesson,locale);
  const first={id:'practice',promptId:practice.id,endedAt:'2026-01-01T00:00:00Z',summary:{accuracy:1,netWpm:40,typedCharacters:graphemes(practice.text).length}};
  const oldReview={id:'review',promptId:'course-'+lesson.id+'-'+locale+'-review',endedAt:'2026-01-01T02:10:00Z',summary:{accuracy:1,netWpm:40,typedCharacters:graphemes(original).length}};
  expect(lessonProgressFromScores([first,oldReview],locale).get(lesson.id)?.mastered).toBe(true);
  expect(lessonProgressFromScores([first,{...oldReview,summary:{...oldReview.summary,typedCharacters:2}}],locale).get(lesson.id)?.mastered).toBe(false);
 });
});
