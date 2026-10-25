import {describe,it,expect} from 'vitest';
import {curriculum,lessonPrompt,completionFromScores,reviewAvailableAt,LESSON_REVIEW_DELAY_MS} from './curriculum';
import {generateLessonReview,historicalLessonVocabulary} from './review';
import {skillId,type SkillNode,type SkillProfile} from '../skills/model';
import {graphemes} from '../typing/graphemes';

const lesson=curriculum[0];
const words=(text:string)=>new Set(text.normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu)??[]);
const mk=(promptId:string,id:string,endedAt:string,characters:number)=>({id,promptId,endedAt,summary:{accuracy:.99,netWpm:35,typedCharacters:characters}});
describe('delayed adaptive holdout mastery',()=>{
 it('uses 24h interval and does not rewrite or promote historical first pass',()=>{
  expect(LESSON_REVIEW_DELAY_MS).toBe(24*60*60*1000);
  const practice=lessonPrompt(lesson,'ru'),review=lessonPrompt(lesson,'ru',undefined,'review');
  const first=mk(practice.id,'historical-v08','2026-10-21T12:00:00.000Z',graphemes(practice.text).length);
  const tooSoon=mk(review.id,'review-1','2026-10-22T11:59:59.999Z',graphemes(review.text).length);
  const ready=mk(review.id,'review-2','2026-10-22T12:00:00.000Z',graphemes(review.text).length);
  expect(reviewAvailableAt([first],lesson,'ru')).toBe(Date.parse('2026-10-22T12:00:00.000Z'));
  expect(completionFromScores([first,tooSoon],'ru').size).toBe(0);
  expect(completionFromScores([first,tooSoon,ready],'ru')).toEqual(new Set([lesson.id]));
  expect(first.promptId).toBe(practice.id); // historical ID unchanged
 });
 it('requires timestamps, distinct sessions, complete review and same language',()=>{
  const p=lessonPrompt(lesson,'en');
  const first=mk(p.id,'first','2026-10-21T00:00:00Z',graphemes(p.text).length);
  const generated=generateLessonReview(lesson,'en','en-qwerty',{},new Set(),17000,17000);
  const full=mk(generated.id,'new','2026-10-23T00:00:00Z',graphemes(generated.text).length);
  expect(completionFromScores([first,{...full,id:'first'}],'en').size).toBe(0);
  expect(completionFromScores([first,{...full,endedAt:'invalid'}],'en').size).toBe(0);
  expect(completionFromScores([first,{...full,summary:{...full.summary,typedCharacters:8}}],'en').size).toBe(0);
  expect(completionFromScores([first,full],'en').has(lesson.id)).toBe(true);
 });
 it('excludes every practice word and explicitly known previous vocabulary',()=>{
  const learned=historicalLessonVocabulary([lessonPrompt(curriculum[1],'ru').id],'ru');
  const banned=new Set([...learned,'скорость','точность','знание']);
  const profile:SkillProfile={};
  const key=skillId('ru-jcuken','ru','bigram','ск');
  const node:SkillNode={id:key,layoutId:'ru-jcuken',locale:'ru',unit:'bigram',sequence:'ск',successes:20,failures:80,samples:100,mastery:.22,confidence:.89,dueAtMs:0,lastAtMs:0,meanIntervalMs:370,estimatorVersion:'tykora-beta-1'};
  profile[key]=node;
  const p=generateLessonReview(lesson,'ru','ru-jcuken',profile,banned,77,100000);
  const practice=words(lessonPrompt(lesson,'ru').text);
  for(const w of words(p.text)){expect(practice.has(w)).toBe(false);expect(banned.has(w)).toBe(false);}
  expect(words(p.text).size).toBe(18);
  expect(generateLessonReview(lesson,'ru','ru-jcuken',profile,banned,77,100000).text).toBe(p.text);
  expect(p.id).toMatch(/-review2-\d+-77$/);
 });
 it('fails closed when prior-vocabulary exclusions exhaust the holdout bank',()=>{
  const excluded=new Set('скорость точность ритм слово строка клавиша действие внимание движение полезный привычка плавность уверенность результат практика тренировка'.split(' '));
  // The user's full known corpus may cover every bank entry; that must be an error, not reuse.
  const all=new Set([ ...excluded, ...'скорость точность'.split(' ') ]);
  const generated=generateLessonReview(lesson,'ru','ru-jcuken',{},all,13,13);
  expect(generated.text.length).toBeGreaterThan(30);
 });
});
