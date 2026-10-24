import Dexie, { type Table } from 'dexie';
import type { SessionRecord } from '../../application/ports/ProgressRepository';
import type { SkillNode } from '../../domain/skills/model';
import type { TrainingPlan } from '../../domain/plans/plan';
import type {LocalProfile} from './IndexedDbProfileRepository';
export interface SettingRow { key: 'app'; value: unknown }
class TykoraDB extends Dexie {
  settings!: Table<SettingRow, string>;
  sessions!: Table<SessionRecord, string>;
  skills!: Table<SkillNode, string>;
  plans!: Table<TrainingPlan, string>;
  profiles!: Table<LocalProfile, string>;
  constructor() {
    super('tykora-db');
    this.version(1).stores({ settings: 'key', sessions: 'id, endedAt, mode, layoutId', skills: 'id, layoutId, unit, updatedAt' });
    // v2 retains the previous session and settings data while evolving skill nodes.
    this.version(2).stores({ settings: 'key', sessions: 'id, endedAt, mode, layoutId', skills: 'id, layoutId, locale, unit, dueAtMs' });
    // Stage 5 adds a training plan without modifying session records.
    this.version(3).stores({settings:'key',sessions:'id, endedAt, mode, layoutId',skills:'id, layoutId, locale, unit, dueAtMs',plans:'id'});
    // Stage 6: optional on-device pseudonym. Existing data is preserved.
    this.version(4).stores({settings:'key',sessions:'id, endedAt, mode, layoutId',skills:'id, layoutId, locale, unit, dueAtMs',plans:'id',profiles:'id'});
  }
}
export const db = new TykoraDB();
