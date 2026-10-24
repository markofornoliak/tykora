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
