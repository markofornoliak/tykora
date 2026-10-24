import { IndexedDbProgressRepository } from '../persistence/IndexedDbProgressRepository';
import { IndexedDbSkillsRepository } from '../persistence/IndexedDbSkillsRepository';
import { IndexedDbSettingsRepository } from '../persistence/IndexedDbSettingsRepository';
import { IndexedDbTrainingPlanRepository } from '../persistence/IndexedDbTrainingPlanRepository';
import {IndexedDbProfileRepository} from '../persistence/IndexedDbProfileRepository';
export const repositories = {
  settings: new IndexedDbSettingsRepository(),
  progress: new IndexedDbProgressRepository(),
  skills: new IndexedDbSkillsRepository(),
  plans: new IndexedDbTrainingPlanRepository(),
  profile: new IndexedDbProfileRepository()
};
