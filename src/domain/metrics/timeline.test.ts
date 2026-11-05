import {describe,it,expect} from 'vitest';
import {createEngine,acceptInput} from '../typing/engine';
import {timelineSample,appendTimelineSample} from './timeline';
describe('aggregate per-second timeline from real engine snapshots',()=>{
 const prompt={id:'timeline',text:'abcdefghijklmno',locale:'en',layoutId:'en-qwerty',mode:'lesson' as const,license:'original' as const};
 it('records sampled metric values but no typed characters or key codes',()=>{
  let s=createEngine(prompt);
  s=acceptInput(s,'abc',1000);
  const one=timelineSample(s,2000);
  expect(one).not.toBeNull();
  expect(one?.second).toBe(1);
  expect(one?.attempts).toBe(3);
  expect(JSON.stringify(one)).not.toContain('abc');
 });
 it('replaces same-second updates; preserves chronology',()=>{
  const first={second:1,netWpm:null,accuracy:1,attempts:1};
  const second={second:1,netWpm:20,accuracy:.9,attempts:6};
  expect(appendTimelineSample([first],second)).toEqual([second]);
  expect(appendTimelineSample([first],{...second,second:2})).toHaveLength(2);
 });
});
