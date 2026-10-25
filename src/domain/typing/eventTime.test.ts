import {describe,it,expect} from 'vitest';
import {normalizedEventTimestamp as normalize} from './eventTime';
describe('native event time to monotonic engine time',()=>{
 it('preserves relative high-resolution timestamps through dispatch delays',()=>{
  expect(normalize(1020,1080,1700000000000)).toBe(1020);
 });
 it('normalizes legacy epoch millisecond timestamps',()=>{
  expect(normalize(1700000001020,1080,1700000000000)).toBe(1020);
 });
 it('clamps tiny clock jitter but not real event delays',()=>{
  expect(normalize(1005,1000,1700000000000)).toBe(1000);
 });
 it('rejects impossible, negative and future timestamps',()=>{
  const origin=1700000000000;
  for(const input of [Number.NaN,Infinity,-1,0,2e9,1700000000000+1e8]){
   expect(normalize(input,9000,origin)).toBe(9000);
  }
 });
 it('refuses invalid receive clocks',()=>{
  expect(()=>normalize(1,-1,1700000000000)).toThrow();
 });
});
