import {describe,it,expect} from 'vitest';
import {curriculum,levels,lessonPrompt,completionFromScores,lessonProgressFromScores,LESSON_MASTERY_ACCURACY,lessonMinimumAccuracy} from './curriculum';
import {graphemes} from '../typing/graphemes';
const lesson=curriculum[0];
function success(variant:'practice'|'review',id:string,locale:'ru'|'en'='ru'){
 const prompt=lessonPrompt(lesson,locale,undefined,variant);
 return {id,promptId:prompt.id,endedAt:variant==='practice'?'2026-10-21T00:00:00.000Z':'2026-10-23T00:00:00.000Z',summary:{accuracy:LESSON_MASTERY_ACCURACY,netWpm:25,typedCharacters:graphemes(prompt.text).length}};
}
describe('course mastery: repeated demonstration on different texts',()=>{
 it('has 124 ordered unique lessons across 10 levels',()=>{
  expect(levels.map(l=>l.count).reduce((a,b)=>a+b,0)).toBe(124);
  expect(curriculum).toHaveLength(124);
  expect(new Set(curriculum.map(l=>l.id)).size).toBe(124);
  expect(curriculum.map(l=>l.index)).toEqual(Array.from({length:124},(_,i)=>i+1));
 });
 for(const locale of ['ru','en'] as const)it(`defines two distinct, deterministic original texts for every lesson in ${locale}`,()=>{
  const first=curriculum.map(l=>lessonPrompt(l,locale));
  const second=curriculum.map(l=>lessonPrompt(l,locale,undefined,'review'));
  expect(new Set(first.map(x=>x.text)).size).toBe(124);
  expect(new Set(second.map(x=>x.text)).size).toBe(124);
  expect(first.every((x,i)=>x.license==='original'&&graphemes(x.text).length>=30&&
    second[i].text!==x.text&&graphemes(second[i].text).length>=30)).toBe(true);
  expect(second.map(x=>x.id).every(id=>id.endsWith('-review'))).toBe(true);
  expect(lessonPrompt(curriculum[0],locale).id).toBe(`course-${curriculum[0].id}-${locale}`);
 });
 it('does not count partial text, even at perfect attempt accuracy',()=>{
  const partial=success('practice','first');
  partial.summary.typedCharacters=1;
  const records=[partial,success('review','second')];
  expect(completionFromScores(records,'ru').size).toBe(0);
  expect(lessonProgressFromScores(records,'ru').get(lesson.id)).toEqual({practice:false,review:true,mastered:false});
 });
 it('retains historical v0.8 success as practice, not automatic mastery',()=>{
  const practice=success('practice','old-v08-id');
  expect(completionFromScores([practice],'ru').size).toBe(0);
  expect(lessonProgressFromScores([practice],'ru').get(lesson.id)).toEqual({practice:true,review:false,mastered:false});
 });
 it('does not reward repeated same-text sessions or duplicate IDs',()=>{
  const first=success('practice','id-1');
  expect(completionFromScores([first,{...first,id:'id-2'}],'ru').size).toBe(0);
  expect(completionFromScores([first,success('review','id-1')],'ru').size).toBe(0);
 });
 it('requires separately successful review in same language',()=>{
  const first=success('practice','id-1');
  const review=success('review','id-2');
  expect(completionFromScores([first,success('review','id-3','en')],'ru').size).toBe(0);
  expect(completionFromScores([first,review],'ru')).toEqual(new Set([lesson.id]));
  expect(lessonProgressFromScores([first,review],'ru').get(lesson.id)).toEqual({practice:true,review:true,mastered:true});
 });
 it('progressively increases minimum accuracy by course level',()=>{
  expect(lessonMinimumAccuracy(curriculum.find(l=>l.level===1)!)).toBe(.95);
  expect(lessonMinimumAccuracy(curriculum.find(l=>l.level===5)!)).toBe(.96);
  expect(lessonMinimumAccuracy(curriculum.find(l=>l.level===10)!)).toBe(.97);
  const advanced=curriculum.find(l=>l.level===10)!;
  const p=lessonPrompt(advanced,'en'),r=lessonPrompt(advanced,'en',undefined,'review');
  const a={id:'advanced-1',promptId:p.id,endedAt:'2026-10-21T00:00:00.000Z',summary:{accuracy:.96,netWpm:60,typedCharacters:graphemes(p.text).length}};
  const b={id:'advanced-2',promptId:r.id,endedAt:'2026-10-23T00:00:00.000Z',summary:{accuracy:.96,netWpm:60,typedCharacters:graphemes(r.text).length}};
  expect(completionFromScores([a,b],'en').has(advanced.id)).toBe(false);
  expect(completionFromScores([{...a,summary:{...a.summary,accuracy:.98}},{...b,summary:{...b.summary,accuracy:.98}}],'en').has(advanced.id)).toBe(true);
 });
 it('rejects low accuracy, missing speed and shortcuts that skip full text',()=>{
  const first=success('practice','id-1');
  const bad=success('review','id-2');bad.summary.accuracy=0.94;
  expect(completionFromScores([first,bad],'ru').size).toBe(0);
  bad.summary.accuracy=1;bad.summary.netWpm=0;
  expect(completionFromScores([first,bad],'ru').size).toBe(0);
 });
});
