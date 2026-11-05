import {describe,expect,it} from 'vitest';
import {palettes} from './palettes';
import {contrastRatio} from './contrast';
import {resolvePalette} from './applyTheme';
const required=[
 ['text','bg',4.5],['text','surface',4.5],['textMuted','bg',4.5],
 ['textMuted','surface',4.5],['textMuted','surface2',4.5],
 ['border','bg',3],['border','surface',3],['border','surface2',3],
 ['focus','bg',3],['focus','surface',3],['focus','surface2',3],
 ['success','surface',3],['error','surface',3],['warning','surface',3],
 ['onAccent','accent',4.5]
] as const;
describe('24-theme semantic role contrast matrix (not manual WCAG)',()=>{
 it('satisfies 15 specified numeric role pairs for every theme',()=>{
  expect(palettes).toHaveLength(24);
  for(const palette of palettes){
   const colors=resolvePalette(palette);
   for(const [foreground,background,minimum] of required)
    expect(contrastRatio(colors[foreground],colors[background]),palette.name+' '+foreground+'/'+background).toBeGreaterThanOrEqual(minimum);
  }
 });
});
