import type { TypingPrompt } from '../typing/contracts';
export interface Lesson {
  readonly id: string;
  readonly courseId: string;
  readonly sequence: number;
  readonly level: number;
  readonly titleKey: string;
  readonly promptIds: readonly TypingPrompt['id'][];
  readonly prerequisiteIds: readonly string[];
  readonly contentVersion: string;
}
