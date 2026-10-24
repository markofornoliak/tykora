import {graphemes} from '../typing/graphemes';
import {skillId,type SkillProfile,type Unit} from './model';

export interface DrillOptions {locale:string;layoutId:string;seed:number;wordCount?:number;recentWords?:readonly string[];nowMs?:number}
function rand(seed:number){let x=(seed>>>0)||1234567;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/2**32;};}
function unitWeakness(profile:SkillProfile,layoutId:string,locale:string,unit:Unit,seq:string,nowMs:number):number {
  const node=profile[skillId(layoutId,locale,unit,seq)];
  if(!node) return .35; // Unknown skills get exploration budget.
  const latencyFactor=node.meanIntervalMs===null?0:Math.min(.35,Math.max(0,node.meanIntervalMs-250)/650);
  const dueBonus=node.dueAtMs<=nowMs?0.18:0;
  return Math.max(.05,(1-node.mastery)*(.3+.7*node.confidence)+latencyFactor+dueBonus);
}
export function wordPriority(word:string,profile:SkillProfile,layoutId:string,locale:string,nowMs:number=Date.now()):number {
  const chars=graphemes(word.toLowerCase());
  let score=0;
  for(let i=0;i<chars.length;i++) {
    score+=unitWeakness(profile,layoutId,locale,'key',chars[i],nowMs);
    if(i>=1) score+=1.75*unitWeakness(profile,layoutId,locale,'bigram',chars.slice(i-1,i+1).join(''),nowMs);
    if(i>=2) score+=2.2*unitWeakness(profile,layoutId,locale,'trigram',chars.slice(i-2,i+1).join(''),nowMs);
  }
  return 0.25+score/Math.max(1,chars.length);
}

/** Deterministic seeded weighted sampling without replacement; no repeated words in a drill.
 * Unknown combinations are explored, mastered combinations retained for spaced practice.
 */
export function generateDrill(profile:SkillProfile,wordBank:readonly string[],options:DrillOptions):string {
  const count=Math.max(1,Math.min(60,Math.floor(options.wordCount??20)));
  const unique=[...new Set(wordBank.map(x=>x.normalize('NFC').trim()).filter(x=>graphemes(x).length>=2 && !/\s/.test(x)))];
  if(!unique.length) throw new Error('A valid nonempty word bank is required');
  const rng=rand(options.seed);
  const recent=new Set(options.recentWords??[]);
  const pool=unique.map(word=>({word,weight:wordPriority(word,profile,options.layoutId,options.locale,options.nowMs??Date.now())*(recent.has(word)?.13:1)}));
  const result:string[]=[];
  for(let i=0;i<Math.min(count,pool.length);i++){
    const total=pool.reduce((acc,w)=>acc+w.weight,0);
    let cursor=rng()*total,selected=pool.length-1;
    for(let j=0;j<pool.length;j++){cursor-=pool[j].weight;if(cursor<0){selected=j;break;}}
    result.push(pool[selected].word);pool.splice(selected,1);
  }
  return result.join(' ');
}
