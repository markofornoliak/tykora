import {db} from './db';
export interface LocalProfile {id:'local';alias:string;createdAt:string;}
export class IndexedDbProfileRepository {
 async get():Promise<LocalProfile|undefined>{return db.profiles.get('local');}
 async save(alias:string):Promise<LocalProfile>{
  const clean=alias.trim().slice(0,32);
  if(!clean)throw new Error('Введите псевдоним.');
  const current=await this.get();
  const profile={id:'local' as const,alias:clean,createdAt:current?.createdAt??new Date().toISOString()};
  await db.profiles.put(profile);return profile;
 }
}
