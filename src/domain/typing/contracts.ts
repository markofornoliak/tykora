/** Stable cross-layer typing contracts. The engine is implemented in ./engine.ts. */
export type KeyboardLayoutId = string;
export type TextLocale = string;
export type TypingMode = 'time' | 'words' | 'quote' | 'custom' | 'lesson' | 'zen';
export interface TypingPrompt {
  readonly id: string;
  readonly text: string;
  readonly locale: TextLocale;
  readonly layoutId: KeyboardLayoutId;
  readonly mode: TypingMode;
  readonly license: 'original' | 'public-domain' | 'cc0' | 'cc-by' | 'other-open' | 'user-provided';
  readonly sourceAttribution?: string;
}
export type InputAction =
  | { readonly type: 'insert'; readonly text: string; readonly timestampMs: number; readonly inputType: string }
  | { readonly type: 'delete'; readonly timestampMs: number; readonly inputType: string }
  | { readonly type: 'composition-start'; readonly timestampMs: number }
  | { readonly type: 'composition-end'; readonly text: string; readonly timestampMs: number }
  | { readonly type: 'reset' };
export interface TypingSummary {
  readonly rawWpm: number; readonly netWpm: number; readonly cpm: number;
  readonly accuracy: number; readonly durationMs: number;
  readonly correctedErrors: number; readonly uncorrectedErrors: number;
  readonly scoringVersion: string;
}
