import {describe,it,expect} from 'vitest';
import {curriculum,lessonPrompt,completionFromScores,reviewAvailableAt,LESSON_REVIEW_DELAY_MS} from './curriculum';
import {generateLessonReview,historicalLessonVocabulary} from './review';
import {skillId,type SkillNode,type SkillProfile} from '../skills/model';
import {graphemes} from '../typing/graphemes';
import {words as vocabulary,diagnostics} from '../content/prompts';

const lesson=curriculum[0];
const words=(text:string)=>new Set(text.normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu)??[]);
const mk=(promptId:string,id:string,endedAt:string,characters:number)=>({id,promptId,endedAt,summary:{accuracy:.99,netWpm:35,typedCharacters:characters}});
describe('delayed adaptive holdout mastery',()=>{
 it('freezes public word-bank index order until a versioned migration exists',()=>{
  // Review IDs reference dictionary indices; changing the order breaks history decoding.
  const checksum=(bank:readonly string[]):number=>{
   let h=2166136261;
   for(const ch of bank.join('\0')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
   return h>>>0;
  };
  expect(vocabulary.ru).toHaveLength(84);
  expect(vocabulary.en).toHaveLength(68);
  expect(checksum(vocabulary.ru)).toBe(1282728466);
  expect(checksum(vocabulary.en)).toBe(1098720761);
 });
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
  expect(p.id).toMatch(/-review2-\d+-77-v-(?:[0-9a-z]+\.)*[0-9a-z]+$/);
 });
 it('round-trips only original word-bank indices, and excludes all earlier generated review words',()=>{
  const seed=117,clock=2026102500000;
  const first=generateLessonReview(lesson,'en','en-qwerty',{},new Set(),seed,clock);
  expect(first.id).toMatch(/^course-L01-01-en-review2-\d+-117-v-(?:[0-9a-z]+\.)*[0-9a-z]+$/);
  const reconstructed=historicalLessonVocabulary([first.id],'en');
  const observed=words(first.text);
  expect(reconstructed).toEqual(observed);
  const second=generateLessonReview(lesson,'en','en-qwerty',{},reconstructed,118,clock);
  for(const w of words(second.text))expect(observed.has(w)).toBe(false);
  const initial=mk(lessonPrompt(lesson,'en').id,'initial','2026-10-20T00:00:00Z',graphemes(lessonPrompt(lesson,'en').text).length);
  const completed=mk(first.id,'reviewed','2026-10-22T00:00:00Z',graphemes(first.text).length);
  expect(completionFromScores([initial,completed],'en')).toEqual(new Set([lesson.id]));
 });
 it('reconstructs historic diagnostics with original public texts but never personal input',()=>{
  for(const locale of ['ru','en'] as const){
   const actual=historicalLessonVocabulary([diagnostics[locale].id],locale);
   expect(actual).toEqual(words(diagnostics[locale].text));
  }
  expect(historicalLessonVocabulary([diagnostics.en.id],'ru')).toEqual(new Set());
 });
 it('excludes learned words from previous adaptive exercises without storing personal text',()=>{
  const indices=['speed','accuracy','rhythm'].map(w=>vocabulary.en.indexOf(w));
  expect(indices.every(i=>i>=0)).toBe(true);
  const id=`adaptive-tykora-beta-1-en-20261025-v-${indices.map(i=>i.toString(36)).join('.')}`;
  const known=historicalLessonVocabulary([id],'en');
  expect(known).toEqual(new Set(['speed','accuracy','rhythm']));
  expect(historicalLessonVocabulary([id],'ru')).toEqual(new Set());
  const review=generateLessonReview(lesson,'en','en-qwerty',{},known,119,119);
  for(const word of words(review.text))expect(known.has(word)).toBe(false);
 });
 it('retains mastery from pre-provenance review2 sessions without inventing their words',()=>{
  const p=lessonPrompt(lesson,'en');
  const before=mk(p.id,'original','2026-10-20T00:00:00Z',graphemes(p.text).length);
  const generated=generateLessonReview(lesson,'en','en-qwerty',{},new Set(),90,90);
  const oldPromptId=generated.id.replace(/-v-[0-9a-z.]+$/,'');
  expect(oldPromptId).not.toBe(generated.id);
  const historic=mk(oldPromptId,'old-review','2026-10-22T00:00:00Z',graphemes(generated.text).length);
  expect(completionFromScores([before,historic],'en')).toEqual(new Set([lesson.id]));
  expect(historicalLessonVocabulary([oldPromptId],'en')).toEqual(new Set());
 });
 it('does not invent vocabulary from earlier review2 IDs that omitted word provenance',()=>{
  // Such pre-migration sessions never contained their target text or selected words.
  expect(historicalLessonVocabulary(['course-L01-01-en-review2-125-77'],'en').size).toBe(0);
 });
 it('fails closed when prior-vocabulary exclusions exhaust the holdout bank',()=>{
  // A fully consumed learning vocabulary must never leak back into a holdout.
  const all=new Set(vocabulary.ru);
  expect(()=>generateLessonReview(lesson,'ru','ru-jcuken',{},all,13,13)).toThrow(/Insufficient/);
 });
});
