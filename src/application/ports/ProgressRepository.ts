import type { TypingMode } from '../../domain/typing/contracts';
import type { Score } from '../../domain/metrics/metrics';
export interface SessionRecord {
  id: string;
  endedAt: string;
  mode: TypingMode;
  locale: string;
  layoutId: string;
  promptId: string;
  summary: Score;
  schemaVersion: 1;
}
export interface ProgressRepository {
  saveSession(session: SessionRecord): Promise<void>;
  getRecentSessions(limit: number): Promise<SessionRecord[]>;
}
