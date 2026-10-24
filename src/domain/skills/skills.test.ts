import {describe,it,expect} from 'vitest';
import {createEngine,acceptInput} from '../typing/engine';
import {updateSkillProfile,skillId} from './model';
import {generateDrill} from './generator';
import {diagnostics,words} from '../content/prompts';
describe('skill adaptation',()=>{
 it('does not learn from short or unfinished sessions',()=>{
  let state=createEngine({...diagnostics.en,text:'abcdefghijklmnopqrst'});state=acceptInput(state,'abcdefghijklmnopqrst',1000);
  expect(updateSkillProfile({},state,1000000)).toEqual({});
 });
 it('updates key, bigram and trigram estimates from eligible completed sessions',()=>{
  let state=createEngine({...diagnostics.en,text:'abcdefghijklmnopqrstuvwxy'});
  state=acceptInput(state,'abcdefghijklmnopqrstuvwxy',10000);
  state={...state,startedAtMs:1000,endedAtMs:10000};
  const p=updateSkillProfile({},state,Date.now());
  expect(p[skillId('en-qwerty','en','key','a')].samples).toBe(1);
  expect(p[skillId('en-qwerty','en','bigram','ab')].samples).toBe(1);
  expect(p[skillId('en-qwerty','en','trigram','abc')].samples).toBe(1);
 });
 it('generates a reproducible, nonrepeating exercise',()=>{
  const opts={locale:'en',layoutId:'en-qwerty',seed:321,wordCount:18};
  const output=generateDrill({},words.en,opts);expect(output).toBe(generateDrill({},words.en,opts));
  const tokens=output.split(' ');expect(new Set(tokens).size).toBe(tokens.length);
 });
});
