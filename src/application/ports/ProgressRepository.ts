import type { TypingMode } from '../../domain/typing/contracts';
import type { Score } from '../../domain/metrics/metrics';
import type { ScoreV2 } from '../../domain/metrics/metricsV2';
/** Aggregated once-per-second WPM/accuracy, without raw keystrokes or typed text.
 * Optional for pre-iteration-5 records and JSON backups (schemaVersion stays 1).
 */
export interface SessionTimelineSample {
 readonly second:number;
 readonly netWpm:number|null;
 readonly accuracy:number;
 readonly attempts:number;
}
export interface SessionRecord {
  id: string;
  endedAt: string;
  mode: TypingMode;
  locale: string;
  layoutId: string;
  promptId: string;
  summary: Score | ScoreV2;
  schemaVersion: 1;
  timeline?:readonly SessionTimelineSample[];
}
export interface ProgressRepository {
  saveSession(session: SessionRecord): Promise<void>;
  getRecentSessions(limit: number): Promise<SessionRecord[]>;
  /** Complete local history for durable lesson mastery and known-word exclusion. */
  getAllSessions(): Promise<SessionRecord[]>;
}
