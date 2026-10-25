import type {TypingPrompt} from '../typing/contracts';
import type {SupportedLocale} from '../content/library';
import {words} from '../content/prompts';
import {lessonPrompt,findLesson,type CourseLesson} from './curriculum';
import {generateDrill} from '../skills/generator';
import type {SkillProfile} from '../skills/model';
import {graphemes} from '../typing/graphemes';
/** A deliberate 24-hour separation tests retention beyond immediate repetition; not a clinical claim. */
export const REVIEW_DELAY_MS=24*60*60*1000;
export const REVIEW_GENERATOR_VERSION=2;
const tokens=(text:string):string[]=>text.normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu)??[];
export function historicalLessonVocabulary(promptIds:readonly string[],locale:SupportedLocale):Set<string>{
 const encountered=new Set<string>();
 for(const id of promptIds){
  const match=/^course-(L\d\d-\d\d)-(ru|en)(-review)?$/.exec(id);
  if(!match||match[2]!==locale)continue;
  const lesson=findLesson(match[1]);if(!lesson)continue;
  for(const word of tokens(lessonPrompt(lesson,locale,undefined,match[3]?'review':'practice').text))encountered.add(word);
 }
 return encountered;
}
/** Fail closed if the available original review bank cannot provide a disjoint assessment.
 * Historic user-supplied text is not retained; old unknown custom sessions are NOT
 * silently claimed to be known. Caller may include recent public prompt vocab.
 */
export function generateLessonReview(lesson:CourseLesson,locale:SupportedLocale,layoutId:string,
 profile:SkillProfile,excludedVocabulary:ReadonlySet<string>,seed:number,asOfMs:number):TypingPrompt {
 const practiceWords=new Set(tokens(lessonPrompt(lesson,locale).text));
 const bank=words[locale].filter(w=>!practiceWords.has(w.normalize('NFC').toLowerCase())&&!excludedVocabulary.has(w.normalize('NFC').toLowerCase()));
 // A valid assessment must contain enough distinct unseen words to prevent trivial repetition.
 if(new Set(bank).size<12)throw new Error('Insufficient previously unseen words to create a review');
 const text=generateDrill(profile,bank,{locale,layoutId,seed,nowMs:asOfMs,wordCount:18});
 const unique=new Set(tokens(text));
 if(unique.size<12 || [...unique].some(w=>practiceWords.has(w)||excludedVocabulary.has(w)))throw new Error('Review word separation failed');
 const length=graphemes(text).length;
 if(length<30||length>600)throw new Error('Review length is invalid');
 return {id:`course-${lesson.id}-${locale}-review2-${length}-${seed>>>0}`,
  text,locale,layoutId,mode:'lesson',license:'original',sourceAttribution:'TYKORA original adaptive holdout bank'};
}
