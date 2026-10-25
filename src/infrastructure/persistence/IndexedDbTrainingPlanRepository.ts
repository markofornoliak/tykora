import type {TrainingPlanRepository} from '../../application/ports/TrainingPlanRepository';
import {validatePlan,type TrainingPlan} from '../../domain/plans/plan';
import {db} from './db';
export class IndexedDbTrainingPlanRepository implements TrainingPlanRepository {
 async get():Promise<TrainingPlan|undefined>{return db.plans.get('current');}
 async save(plan:TrainingPlan):Promise<void>{if(!validatePlan(plan))throw new Error('Invalid training plan');await db.plans.put(plan);}
}
