import type { Palette } from './palettes';
import { contrastRatio, luminance } from './contrast';

export function validatePalette(p: Palette): string[] {
  const errors: string[] = [];
  if (contrastRatio(p.text, p.bg) < 4.5) errors.push('Text/background contrast is below 4.5:1');
  if (contrastRatio(p.text, p.surface) < 4.5) errors.push('Text/surface contrast is below 4.5:1');
  if (contrastRatio(p.accent,p.bg) < 4.5 || contrastRatio(p.accent,p.surface) < 4.5)
    errors.push('Accent contrast on body and surface must reach 4.5:1');
  return errors;
}
export function applyTheme(p: Palette) {
  const root = document.documentElement;
  const dark = luminance(p.bg) < .18;
  const vars: Record<string, string> = {
    '--bg': p.bg, '--surface': p.surface, '--text': p.text, '--accent': p.accent,
    '--panel': dark ? '#27342f' : '#f0f2ed',
    '--muted': dark ? '#c4cec9' : '#52625b',
    '--border': dark ? '#53615a' : '#dfe5df',
    '--accent-soft': dark ? '#253e36' : '#e6f2ed',
    '--on-accent': contrastRatio('#ffffff', p.accent) >= 4.5 ? '#ffffff' : '#101815',
    '--ring': p.accent, '--danger': dark ? '#ffd5d8' : '#a63139',
    '--danger-soft': dark ? '#5b2c33' : '#f9e8e8'
  };
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', p.bg);
}
