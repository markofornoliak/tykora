import {describe,it,expect} from 'vitest';
import {createEngine,acceptInput} from './engine';
import {diagnostics} from '../content/prompts';
const prompt={...diagnostics.en,text:'abcde'};
describe('IME-safe text engine',()=>{
 it('starts on first insertion, never on focus or deletion',()=>{
  const initial=createEngine(prompt);expect(initial.startedAtMs).toBe(null);
  const state=acceptInput(initial,'a',1200);expect(state.startedAtMs).toBe(1200);expect(state.attempts).toHaveLength(1);
 });
 it('tracks a corrected error and deletion',()=>{
  let s=createEngine(prompt);s=acceptInput(s,'abx',1000);s=acceptInput(s,'ab',2000);s=acceptInput(s,'abcde',9000);
  expect(s.correctedErrors).toBe(1);expect(s.deletions).toBe(1);expect(s.attempts).toHaveLength(6);expect(s.endedAtMs).toBe(9000);
 });
 it('ignores pastes, never uses keyboard layout codes to derive characters',()=>{
  const initial=createEngine(prompt);expect(acceptInput(initial,'abcde',1000,'paste')).toEqual(initial);
 });
 it('handles NFC combined characters and grapheme-aware cursor',()=>{
  const s=createEngine({...prompt,text:'café!'});expect(acceptInput(s,'cafe\u0301!',1000).typed).toBe('café!');
 });
 it('does not count duplicate composition commits as extra attempts',()=>{
  const s=createEngine({...prompt,text:'日本abc'});const first=acceptInput(s,'日本',1000,'composition');
  expect(acceptInput(first,'日本',1100,'composition').attempts).toHaveLength(2);
 });
 it('can finish with uncorrected errors',()=>{
  expect(acceptInput(createEngine(prompt),'abxde',2000).endedAtMs).toBe(2000);
 });
});

describe('long-form Unicode and rapid input regression',()=>{
 it('treats emoji with ZWJ and combining marks as single graphemes',()=>{
  const prompt={...diagnostics.en,text:'A👨‍👩‍👧éБ中'};
  const normalized='A👨‍👩‍👧éБ中';
  const state=acceptInput(createEngine(prompt),normalized,1100);
  expect(state.typed).toBe(normalized);
  expect(state.attempts).toHaveLength(5);
  expect(state.attempts.every(a=>a.correct)).toBe(true);
 });
 it('does not lose any of 500 accepted rapid sequential inputs',()=>{
  const text='ab'.repeat(250);
  let state=createEngine({...diagnostics.en,text});
  for(let i=1;i<=text.length;i++) state=acceptInput(state,text.slice(0,i),1000+i);
  expect(state.typed).toBe(text);
  expect(state.attempts).toHaveLength(500);
  expect(state.attempts[0].atMs).toBe(1001);
  expect(state.attempts[499].atMs).toBe(1500);
  expect(state.endedAtMs).toBe(1500);
 });
 it('corrects an edit in the middle without shifting later graphemes',()=>{
  let state=createEngine({...diagnostics.en,text:'abcde!'});
  state=acceptInput(state,'abxde',1000);
  state=acceptInput(state,'abcde',2000);
  expect(state.attempts.at(-1)).toMatchObject({char:'c',position:2,correct:true});
  state=acceptInput(state,'abcde!',2500);
  expect(state.correctedErrors).toBe(1);
  expect(state.deletions).toBe(1);
  expect(state.typed).toBe('abcde!');
  expect(state.endedAtMs).toBe(2500);
 });
 it('preserves newlines and Cyrillic/Latin text through insert and delete',()=>{
  const text='Да\nOK!🙌';
  let state=createEngine({...diagnostics.en,text});
  state=acceptInput(state,'Да\nOX',900);
  state=acceptInput(state,'Да\nO',1000);
  state=acceptInput(state,text,1200);
  expect(state.typed).toBe(text);
  expect(state.attempts.some(a=>a.char==='\n')).toBe(true);
  expect(state.correctedErrors).toBe(1);
  expect(state.endedAtMs).toBe(1200);
 });
});
