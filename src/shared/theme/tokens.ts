export type SemanticColor='surface'|'surface2'|'text'|'textMuted'|'accent'|'success'|'error'|'warning'|'focus'|'border';
export const spacingScale=[4,8,12,16,24,32,48] as const;
export type Spacing=typeof spacingScale[number];
export const motionDurations={fast:120,base:200,slow:320} as const;
export type MotionDuration=keyof typeof motionDurations;
