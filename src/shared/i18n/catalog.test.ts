import {describe,it,expect} from 'vitest';
import {resources,uiLocales,verifyCatalog} from './catalog';
import {pageCopy} from './pageCopy';
const names=['homeTitle','homeIntro','practiceTitle','practiceIntro','homeNext','practiceNext'] as const;
const placeholders=(v:string)=>[...v.matchAll(/\{\{\s*([\w.]+)\s*\}\}|\{([A-Za-z][\w]*)\}/g)].map(m=>m[1]??m[2]).sort();
describe('i18n completeness and placeholders on every supported locale',()=>{
 it('has complete, nonempty and consistent chrome key inventories',()=>{
  expect(uiLocales).toHaveLength(10);
  expect(verifyCatalog()).toEqual([]);
  const reference=Object.keys(resources.ru.translation).sort();
  for(const locale of uiLocales){
   expect(Object.keys(resources[locale].translation).sort()).toEqual(reference);
   for(const key of reference){
    expect(resources[locale].translation[key as keyof typeof resources.ru.translation].trim()).not.toBe('');
    expect(placeholders(resources[locale].translation[key as keyof typeof resources.ru.translation])).toEqual(placeholders(resources.ru.translation[key as keyof typeof resources.ru.translation]));
   }
  }
 });
 it('has all six visible page-copy keys and matching parameter names',()=>{
  for(const locale of uiLocales)for(const key of names){
   expect(pageCopy[locale][key]?.trim().length).toBeGreaterThan(0);
   expect(placeholders(pageCopy[locale][key])).toEqual(placeholders(pageCopy.ru[key]));
  }
 });
});
