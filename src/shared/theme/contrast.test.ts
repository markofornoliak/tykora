import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { palettes } from './palettes';
import { validatePalette } from './applyTheme';

describe('theme contrast', () => {
  it('black on white is 21:1', () => expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21));
  it('24 palettes are defined', () => expect(palettes).toHaveLength(24));
  it('default palettes meet base text ratios', () => {
    for (const p of palettes) {
      expect(contrastRatio(p.text, p.bg), p.name).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.text, p.surface), p.name).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('invalid palette is rejected', () => {
    expect(validatePalette({ name: 'bad', bg: '#ffffff', surface: '#ffffff', text: '#dddddd', accent: '#eeeeee' }).length).toBeGreaterThan(0);
  });
});
