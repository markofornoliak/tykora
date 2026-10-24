import { db } from './db';
import type { ProgressRepository, SessionRecord } from '../../application/ports/ProgressRepository';

export class IndexedDbProgressRepository implements ProgressRepository {
  async saveSession(session: SessionRecord): Promise<void> { await db.sessions.put(session); }
  async getRecentSessions(limit: number): Promise<SessionRecord[]> {
    return db.sessions.orderBy('endedAt').reverse().limit(Math.max(0, limit)).toArray();
  }
}
