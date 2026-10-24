export function luminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error('Expected #RRGGBB');
  const rgb = [1, 3, 5].map((pos) => parseInt(hex.slice(pos, pos + 2), 16) / 255);
  const linear = rgb.map((v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
export function contrastRatio(a: string, b: string): number {
  const x = luminance(a); const y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
