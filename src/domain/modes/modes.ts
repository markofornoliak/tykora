import {words} from '../content/prompts';
import {getPassages,passagePrompt,type SupportedLocale,type TrackId} from '../content/library';
import type {TypingPrompt} from '../typing/contracts';
import {graphemes} from '../typing/graphemes';

export type ModeId='diagnostic'|'adaptive'|'time'|'words'|'quote'|'custom'|'zen'|'hardcore'|'blind'|'burst'|'daily'|'marathon';
export interface ModeConfig { mode:ModeId;locale:SupportedLocale;layoutId:string;seed:number;count?:number;durationSeconds?:number;track?:TrackId;customText?:string;}
export const modeLabels:Record<ModeId,string>={diagnostic:'Диагностика',adaptive:'Адаптивная',time:'На время',words:'Количество слов',quote:'Цитаты и тексты',custom:'Свой текст',zen:'Zen',hardcore:'Hardcore',blind:'Слепой режим',burst:'Burst',daily:'Задание дня',marathon:'Марафон'};
const rng=(seed:number)=>{let state=seed>>>0 || 73291;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};};
export function seedFromDate(date:string,locale:SupportedLocale):number{let h=2166136261;for(const c of `${date}:${locale}`){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function pickWords(locale:SupportedLocale,count:number,seed:number):string {
 const bank=words[locale];const next=rng(seed);const output:string[]=[];
 // Repeats are allowed in marathon, but no same word twice in a row.
 for(let i=0;i<count;i++){let candidate=bank[Math.floor(next()*bank.length)];
  if(output.at(-1)===candidate)candidate=bank[(bank.indexOf(candidate)+1)%bank.length];
  output.push(candidate);}
 return output.join(' ');
}
export function promptForMode(options:ModeConfig):TypingPrompt {
 const {mode,locale,layoutId,seed,track='general'}=options;
 const base={locale,layoutId,license:'original' as const,sourceAttribution:'TYKORA original content'};
 if(mode==='custom'){
  const text=(options.customText??'').normalize('NFC').replace(/\r\n?/g,'\n').split('\r').join('').trim();
  if(graphemes(text).length>6000)throw new Error('Custom text is limited to 6,000 graphemes');
  if(graphemes(text).length<2)throw new Error('Custom text requires at least 2 characters');
  return {...base,id:`custom-local-${seed}`,mode:'custom',text,license:'user-provided',sourceAttribution:'User-provided local text; licensing responsibility remains with the user'};
 }
 if(mode==='quote') {
  const optionsForTrack=getPassages(locale,track);
  const fallback=getPassages(locale,'general');const optionsAll=optionsForTrack.length?optionsForTrack:fallback;
  return passagePrompt(optionsAll[seed%optionsAll.length],layoutId);
 }
 const count=mode==='burst'?12:mode==='marathon'?260:mode==='zen'?500:mode==='time'?500:Math.min(100,Math.max(5,options.count??25));
 return {...base,id:`${mode}-${locale}-${seed}`,mode:mode==='zen'?'zen':mode==='time'?'time':'words',text:pickWords(locale,count,seed)};
}
