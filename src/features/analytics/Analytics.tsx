import {useEffect,useState} from 'react';
import { Kpi, PageHeader, Placeholder } from '../../shared/ui/Layout';
import { repositories } from '../../infrastructure/di/repositories';
import type { SessionRecord } from '../../application/ports/ProgressRepository';
import {weakestSkills,type SkillNode} from '../../domain/skills/model';
export function Analytics(){
 const [sessions,setSessions]=useState<SessionRecord[]>([]);
 const [weak,setWeak]=useState<SkillNode[]>([]);
 const [error,setError]=useState(false);
 useEffect(()=>{let live=true;(async()=>{try{
   const s=await repositories.progress.getRecentSessions(30);
   if(!live)return;setSessions(s);
   if(s[0]){const profile=await repositories.skills.byLayout(s[0].layoutId,s[0].locale);if(live)setWeak(weakestSkills(profile,s[0].layoutId,s[0].locale));}
 }catch{if(live)setError(true);}})();return()=>{live=false;};},[]);
 const last=sessions[0];const ordered=[...sessions].reverse();const max=Math.max(20,...ordered.map(x=>x.summary.netWpm));
 const points=ordered.map((x,i)=>`${30+ (i/Math.max(1,ordered.length-1))*640},${180-(x.summary.netWpm/max)*148}`).join(' ');
 return <section><PageHeader kicker="Исследуйте свой навык" title="Прогресс, который можно объяснить.">Никаких искусственных рекордов: графики строятся только по вашим завершённым тестам.</PageHeader>
 <div className="grid3"><Kpi label="Последний Net WPM" value={last?last.summary.netWpm.toFixed(1):'—'} note={last?'Последний тест':'Нет занятий'}/><Kpi label="Точность" value={last?`${(last.summary.accuracy*100).toFixed(1)}%`:'—'} note="По всем попыткам"/><Kpi label="Завершённые сессии" value={String(sessions.length)} note="Последние 30 результатов"/></div>
 <div className="section-title"><h2>Скорость на завершённых тестах</h2></div>
 <div className="surface card">{ordered.length>=2?<svg viewBox="0 0 700 205" role="img" aria-label="График Net WPM по хронологии занятий" className="chart"><line x1="30" x2="670" y1="180" y2="180" stroke="var(--border)"/><polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{ordered.map((x,i)=><circle key={x.id} cx={30+i/Math.max(1,ordered.length-1)*640} cy={180-x.summary.netWpm/max*148} r="4" fill="var(--accent)"/>)}</svg>:<Placeholder>Пройдите хотя бы два теста, чтобы увидеть динамику.</Placeholder>}</div>
 <div className="section-title"><h2>Рекомендации</h2></div>
 <div className="surface card">{weak.length?<div className="lesson-list">{weak.map(n=><div className="lessonline" key={n.id}><span><b>{n.sequence}</b> · {n.unit}</span><span className="small muted">{n.samples} наблюдений · оценка {(n.mastery*100).toFixed(0)}%</span></div>)}</div>:<Placeholder>Адаптивная модель пока не имеет достаточно наблюдений. Упражняйтесь на целых текстах, чтобы накопить историю сочетаний.</Placeholder>}
 {error&&<p role="status">Локальная база недоступна; история может не сохраняться.</p>}</div>
 </section>;
}
