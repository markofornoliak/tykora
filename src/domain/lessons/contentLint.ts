import {curriculum,lessonPrompt} from './curriculum';
import {graphemes} from '../typing/graphemes';
export type LessonContentIssue={id:string;locale:'ru'|'en';reason:string;detail?:number};
function grams(text:string,n:number):Set<string>{
 const letters=graphemes(text.normalize('NFC'));const out=new Set<string>();
 for(let i=0;i+n<=letters.length;i++)out.add(letters.slice(i,i+n).join(''));
 return out;
}
export function overlapRatio(practice:string,review:string,n=4):number{
 const a=grams(practice,n),b=grams(review,n);
 return b.size?[...b].filter(g=>a.has(g)).length/b.size:1;
}
/** Versioned, original-only practice/review separation check. */
export function lintLessonContent(limit=0.10):LessonContentIssue[]{
 const issues:LessonContentIssue[]=[];
 for(const locale of ['ru','en'] as const){
  for(const lesson of curriculum.slice(0,3)){
   const a=lessonPrompt(lesson,locale),b=lessonPrompt(lesson,locale,undefined,'review');
   const overlap=overlapRatio(a.text,b.text);
   if(overlap>=limit)issues.push({id:lesson.id,locale,reason:'practice/review 4-gram overlap',detail:overlap});
   if(a.id===b.id)issues.push({id:lesson.id,locale,reason:'identical IDs'});
   if(a.text===b.text)issues.push({id:lesson.id,locale,reason:'identical content'});
   for(const [label,txt] of [['practice',a.text],['review',b.text]] as const){
    const length=graphemes(txt).length;
    if(length<30||length>800)issues.push({id:lesson.id,locale,reason:label+' length',detail:length});
    if(Array.from(txt).some(char=>char==='<'||char==='>'||char.charCodeAt(0)<9))issues.push({id:lesson.id,locale,reason:label+' forbidden character'});
   }
   const focus=locale==='ru'?lesson.focusRu:lesson.focusEn;
   const required=new Set(graphemes(focus).filter(x=>x.trim().length>0));
   const seen=new Set(graphemes(b.text));
   for(const key of required)if(!seen.has(key))issues.push({id:lesson.id,locale,reason:'missing target key '+key});
  }
 }
 return issues;
}
