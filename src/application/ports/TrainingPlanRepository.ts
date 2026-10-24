import type {TrainingPlan} from '../../domain/plans/plan';
export interface TrainingPlanRepository {
 get():Promise<TrainingPlan|undefined>;
 save(plan:TrainingPlan):Promise<void>;
}
