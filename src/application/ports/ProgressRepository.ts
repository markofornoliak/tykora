import type { TypingMode } from '../../domain/typing/contracts';
import type { Score } from '../../domain/metrics/metrics';
import type { ScoreV2 } from '../../domain/metrics/metricsV2';
export interface SessionRecord {
  id: string;
  endedAt: string;
  mode: TypingMode;
  locale: string;
  layoutId: string;
  promptId: string;
  summary: Score | ScoreV2;
  schemaVersion: 1;
}
export interface ProgressRepository {
  saveSession(session: SessionRecord): Promise<void>;
  getRecentSessions(limit: number): Promise<SessionRecord[]>;
}
