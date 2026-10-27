import {describe,it,expect} from 'vitest';
import {ergonomicsTip,ergonomicsTips} from './ergonomics';

describe('curated RU/EN ergonomics guidance',()=>{
 for(const locale of ['ru','en'] as const){
  it(`has 30 distinct original NFC hints without user data (${locale})`,()=>{
   const tips=ergonomicsTips[locale];
   expect(tips).toHaveLength(30);
   expect(new Set(tips).size).toBe(30);
   expect(tips.every(t=>t===t.normalize('NFC')&&t.length>=30&&!t.endsWith(' '))).toBe(true);
  });
  it(`rotates deterministically within the level (${locale})`,()=>{
   expect(ergonomicsTip(locale,0)).toBe(ergonomicsTips[locale][0]);
   expect(ergonomicsTip(locale,30)).toBe(ergonomicsTips[locale][0]);
   expect(ergonomicsTip(locale,29)).toBe(ergonomicsTips[locale][29]);
  });
 }
 it('rejects invalid ordinals',()=>{
  expect(()=>ergonomicsTip('ru',-1)).toThrow();
  expect(()=>ergonomicsTip('en',Number.NaN)).toThrow();
 });
});
