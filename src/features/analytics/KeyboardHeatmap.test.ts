import {describe,it,expect} from 'vitest';
import {heatBin} from './KeyboardHeatmap';
describe('observed keyboard heat bins',()=>{
 it('never invents values for unobserved keys',()=>expect(heatBin({samples:0,failures:0})).toBeNull());
 it('bins finite rates from 0 to 1',()=>{
  expect(heatBin({samples:100,failures:0})).toBe(0);
  expect(heatBin({samples:100,failures:40})).toBe(2);
  expect(heatBin({samples:100,failures:100})).toBe(4);
 });
});
