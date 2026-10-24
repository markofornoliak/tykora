/** A visible Unicode character, not a UTF-16 code unit. Never trim typed input. */
export function graphemes(value: string): string[] {
  const normalized = value.normalize('NFC');
  if (typeof Intl.Segmenter !== 'undefined') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(normalized), x => x.segment);
  }
  // Fallback is intentionally limited; modern supported browsers expose Intl.Segmenter.
  return Array.from(normalized);
}

export function graphemeLength(value: string): number {
  return graphemes(value).length;
}
