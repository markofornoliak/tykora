import {db} from './db';
import {updateSkillProfile,type SkillProfile} from '../../domain/skills/model';
import type {EngineState} from '../../domain/typing/engine';

export class IndexedDbSkillsRepository {
  async byLayout(layoutId:string,locale:string):Promise<SkillProfile>{
    const rows=(await db.skills.where('layoutId').equals(layoutId).toArray()).filter(row=>row.locale===locale && 'successes' in row);
    return Object.fromEntries(rows.map(row=>[row.id,row]));
  }
  async incorporate(state:EngineState):Promise<void>{
    const {layoutId,locale}=state.prompt;
    await db.transaction('rw',db.skills, async()=>{
      const rows=await this.byLayout(layoutId,locale);
      const next=updateSkillProfile(rows,state,Date.now());
      await db.skills.bulkPut(Object.values(next));
    });
  }
}
