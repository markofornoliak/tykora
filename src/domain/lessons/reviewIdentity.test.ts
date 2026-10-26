import {describe,it,expect} from 'vitest';
import {recoverReviewLength} from './reviewIdentity';
import {curriculum,lessonPrompt,completionFromScores} from './curriculum';
import {generateLessonReview} from './review';
import {graphemes} from '../typing/graphemes';
describe('self-describing review validation',()=>{
 const lesson=curriculum[0];
 it('round-trips generated exact length and keeps the historic first pass unchanged',()=>{
  const prompt=generateLessonReview(lesson,'en','en-qwerty',{},new Set(),1234,1234);
  expect(recoverReviewLength(prompt.id,'en')).toBe(graphemes(prompt.text).length);
  expect(recoverReviewLength(prompt.id,'ru')).toBeNull();
  expect(lessonPrompt(lesson,'en').id).toBe('course-L01-01-en');
 });
 it('rejects fabricated lengths, unknown versions, duplicate indices and invalid bank positions',()=>{
  const prompt=generateLessonReview(lesson,'en','en-qwerty',{},new Set(),1234,1234);
  expect(recoverReviewLength(prompt.id.replace(/-review2-\d+-/,'-review2-599-'),'en')).toBeNull();
  expect(recoverReviewLength(prompt.id.replace('-model-tykora-beta-1-','-model-future-9-'),'en')).toBeNull();
  const parts=prompt.id.split('-v-');
  expect(recoverReviewLength(parts[0]+'-v-0.0.0.0.0.0.0.0.0.0.0.0','en')).toBeNull();
  expect(recoverReviewLength(parts[0]+'-v-zz.zz.zz.zz.zz.zz.zz.zz.zz.zz.zz.zz','en')).toBeNull();
 });
 it('never awards mastery for a forged self-describing review, even after sufficient time',()=>{
  const first=lessonPrompt(lesson,'en');
  const review=generateLessonReview(lesson,'en','en-qwerty',{},new Set(),50,50);
  const a={id:'first',endedAt:'2026-10-20T10:00:00Z',promptId:first.id,summary:{accuracy:1,netWpm:40,typedCharacters:graphemes(first.text).length}};
  const b={id:'review',endedAt:'2026-10-21T11:00:00Z',promptId:review.id,summary:{accuracy:1,netWpm:40,typedCharacters:graphemes(review.text).length}};
  expect(completionFromScores([a,b],'en')).toEqual(new Set([lesson.id]));
  expect(completionFromScores([a,{...b,promptId:b.promptId.replace('-model-tykora-beta-1-','-model-wrong-7-')}],'en').size).toBe(0);
 });
});
