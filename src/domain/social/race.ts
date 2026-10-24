import {pickWords} from '../modes/modes';
import {graphemes} from '../typing/graphemes';

export type BotDifficulty='beginner'|'intermediate'|'advanced';
export interface BotSpec {id:string;name:string;speedWpm:number;phase:number;}
export function stableSeed(input:string):number {
 let seed=2166136261;
 for(const char of input){seed^=char.charCodeAt(0);seed=Math.imul(seed,16777619);}
 return seed>>>0;
}
export function sanitizeRoomId(raw:string):string{return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,28);}
export function raceText(roomId:string,locale:'ru'|'en'):string {
 return pickWords(locale,36,stableSeed(`race-v1:${sanitizeRoomId(roomId)}:${locale}`));
}
export function makeBots(seed:string,difficulty:BotDifficulty):BotSpec[]{
 const base={beginner:30,intermediate:55,advanced:85}[difficulty];
 const hash=stableSeed(seed);
 return Array.from({length:3},(_,i)=>({id:`bot-${i}`,name:['Тихий ветер','Ровный ритм','Быстрый набор'][i],speedWpm:base+(i-1)*8+hash%5,phase:(hash%31+i*7)/11}));
}
/** Simulated bot movement: never pass off the generated pace as a human record. */
export function botProgress(bot:BotSpec,elapsedMs:number,text:string):number {
 if(elapsedMs<=0)return 0;
 const chars=graphemes(text).length;
 if(chars===0)return 0;
 const nominal=bot.speedWpm*5*elapsedMs/60000;
 const wobble=Math.sin(elapsedMs/2200+bot.phase)*Math.min(1.8,nominal*0.045);
 return Math.max(0,Math.min(1,(nominal+wobble)/chars));
}
export function raceProgress(typed:string,text:string):number{
 const target=graphemes(text),actual=graphemes(typed);
 let correct=0;
 for(let i=0;i<Math.min(target.length,actual.length);i++){if(actual[i]===target[i])correct++;}
 return target.length?correct/target.length:0;
}
