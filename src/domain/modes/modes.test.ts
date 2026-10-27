import {describe,it,expect} from 'vitest';
import {promptForMode,seedFromDate} from './modes';
import {passages} from '../content/library';
import {createEngine,acceptInput,finishEngine} from '../typing/engine';
import {calculateScore} from '../metrics/metrics';
describe('stage 5 modes',()=>{
 const base={locale:'en' as const,layoutId:'en-qwerty',seed:34};
 it('has original provenance for curated text and no empty passages',()=>{
  expect(passages).toHaveLength(92);
  expect(passages.filter(p=>p.track==='code-sql'&&p.locale==='ru')).toHaveLength(24);
  expect(passages.filter(p=>p.track==='code-sql'&&p.locale==='en')).toHaveLength(24);
  expect(passages.filter(p=>p.id.startsWith('tykora-original-'))).toHaveLength(44);
  expect(passages.every(p=>p.license==='original'&&p.text.length>20)).toBe(true);
 });
 it('generates deterministic daily exercise',()=>{
  const seed=seedFromDate('2026-10-25','en');
  expect(promptForMode({...base,mode:'daily',seed})).toEqual(promptForMode({...base,mode:'daily',seed}));
 });
 it('accepts locally provided Unicode text and tracks provenance separately',()=>{
  const custom=promptForMode({...base,mode:'custom',customText:'cafe\u0301 greeting'});
  expect(custom.text).toBe('café greeting');expect(custom.license).toBe('user-provided');
 });
 it('does not count all remaining passage words as errors in timed completion',()=>{
  const p=promptForMode({...base,mode:'time'});
  let s=createEngine(p);s=acceptInput(s,p.text.slice(0,22),1000);s=finishEngine(s,16000);
  expect(calculateScore(s,16000).uncorrectedErrors).toBe(0);
  expect(calculateScore(s,16000).durationMs).toBe(15000);
 });
 it('manual end before any input is ignored',()=>{
  const p=promptForMode({...base,mode:'zen'});
  expect(finishEngine(createEngine(p),1000).endedAtMs).toBeNull();
 });
});
