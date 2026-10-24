import {describe,it,expect} from 'vitest';
import {createEngine,acceptInput} from '../typing/engine';
import {calculateScore} from './metrics';
import {alignText} from './alignment';
import {diagnostics} from '../content/prompts';
const prompt={...diagnostics.en,text:'abcdefghij'};
describe('alignment',()=>{
 it('finds substitution',()=>expect(alignText('abcd','abxd').errors.map(x=>x.kind)).toEqual(['substitution']));
 it('finds omission',()=>expect(alignText('abcd','acd').errors.map(x=>x.kind)).toEqual(['omission']));
 it('finds insertion',()=>expect(alignText('abcd','abxcd').errors.map(x=>x.kind)).toEqual(['insertion']));
 it('finds adjacent transposition',()=>expect(alignText('abcd','acbd').errors.map(x=>x.kind)).toEqual(['transposition']));
 it('counts emoji as one grapheme',()=>expect(alignText('a👨‍👩‍👧b','a👨‍👩‍👧b').correct).toBe(3));
});
describe('metrics',()=>{
 it('reports correctly defined 5-character WPM',()=>{
  let s=createEngine(prompt);s=acceptInput(s,'abcdefghij',1000);s={...s,startedAtMs:0,endedAtMs:60000};
  const score=calculateScore(s,60000);expect(score.rawWpm).toBe(2);expect(score.netWpm).toBe(2);expect(score.accuracy).toBe(1);
 });
 it('does not invent accuracy on empty session',()=>{const score=calculateScore(createEngine(prompt),100);expect(score.rawWpm).toBe(0);expect(score.accuracy).toBe(0)});
 it('corrected errors affect raw attempts but not final text quality',()=>{
  let s=createEngine(prompt);s=acceptInput(s,'abx',1000);s=acceptInput(s,'ab',1300);s=acceptInput(s,'abcdefghij',10000);
  const score=calculateScore(s,10000);expect(score.correctedErrors).toBe(1);expect(score.accuracy).toBeLessThan(1);expect(score.uncorrectedErrors).toBe(0);
 });
});

describe('long exercise scoring',()=>{
 it('scores multi-thousand character marathon input without the former 1,200 grapheme crash',()=>{
  const text='the quick brown fox jumps over the lazy dog. '.repeat(100);
  const withError=text.slice(0,1700)+'z'+text.slice(1701);
  expect(alignText(text,withError).distance).toBe(1);
  expect(alignText(text,withError).correct).toBe(text.length-1);
 });
 it('handles changes near the front and end of a long paragraph',()=>{
  const text='abcdefg'.repeat(700);
  const observed='x'+text.slice(1,-1)+'y';
  expect(alignText(text,observed).distance).toBe(2);
 });
});
