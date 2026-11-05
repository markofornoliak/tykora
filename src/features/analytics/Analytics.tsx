import {useEffect,useState} from 'react';
import { Kpi, PageHeader, Placeholder } from '../../shared/ui/Layout';
import { repositories } from '../../infrastructure/di/repositories';
import type { SessionRecord } from '../../application/ports/ProgressRepository';
import {displayWpm} from '../../shared/utils/formatMetrics';
import {weakestSkills,type SkillNode} from '../../domain/skills/model';
import {KeyboardHeatmap} from './KeyboardHeatmap';
import {useBilingual} from '../../shared/i18n/useBilingual';
export function Analytics(){
 const tr=useBilingual();
 const [sessions,setSessions]=useState<SessionRecord[]>([]);
 const [weak,setWeak]=useState<SkillNode[]>([]);
 const [keyNodes,setKeyNodes]=useState<SkillNode[]>([]);
 const [error,setError]=useState(false);
 useEffect(()=>{let live=true;(async()=>{try{
   const s=await repositories.progress.getRecentSessions(30);
   if(!live)return;setSessions(s);
   if(s[0]){const profile=await repositories.skills.byLayout(s[0].layoutId,s[0].locale);if(live){setWeak(weakestSkills(profile,s[0].layoutId,s[0].locale));setKeyNodes(Object.values(profile).filter(n=>n.unit==='key'));}}
 }catch{if(live)setError(true);}})();return()=>{live=false;};},[]);
 const last=sessions[0];const ordered=[...sessions].reverse().filter(x=>x.summary.netWpm!==null);const max=Math.max(20,...ordered.map(x=>x.summary.netWpm??0));
 const points=ordered.map((x,i)=>`${30+ (i/Math.max(1,ordered.length-1))*640},${180-((x.summary.netWpm??0)/max)*148}`).join(' ');
 return <section><PageHeader kicker={tr('Исследуйте свой навык','Explore your skill')} title={tr('Прогресс, который можно объяснить.','Progress you can explain.')}>{tr('Никаких искусственных рекордов: графики строятся только по вашим завершённым тестам.','No artificial records: charts use only your completed typing sessions.')}</PageHeader>
 <div className="grid3"><Kpi label={tr('Последний Net WPM','Latest Net WPM')} value={last?displayWpm(last.summary.netWpm):'—'} note={last?tr('Последний тест','Latest test'):tr('Нет занятий','No sessions')}/><Kpi label={tr('Точность','Accuracy')} value={last?`${(last.summary.accuracy*100).toFixed(1)}%`:'—'} note={tr('По всем попыткам','Across all attempts')}/><Kpi label={tr('Завершённые сессии','Completed sessions')} value={String(sessions.length)} note={tr('Последние 30 результатов','Latest 30 results')}/></div>
 <div className="section-title"><h2>{tr('Скорость на завершённых тестах','Speed across completed tests')}</h2></div>
 <div className="surface card">{ordered.length>=2?<svg viewBox="0 0 700 205" role="img" aria-label={tr('График Net WPM по хронологии занятий','Net WPM chart across saved sessions')} className="chart"><line x1="30" x2="670" y1="180" y2="180" stroke="var(--border)"/><polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{ordered.map((x,i)=><circle key={x.id} cx={30+i/Math.max(1,ordered.length-1)*640} cy={180-(x.summary.netWpm??0)/max*148} r="4" fill="var(--accent)"/>)}</svg>:<Placeholder>{tr('Пройдите хотя бы два теста, чтобы увидеть динамику.','Complete two exercises to view a meaningful trend.')}</Placeholder>}
 {ordered.length>0&&<details style={{marginTop:20}}>
  <summary style={{cursor:'pointer'}}>{tr('Таблица результатов графика','Chart results table')} ({ordered.length})</summary>
  <div style={{overflowX:'auto',marginTop:12}}>
   <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
    <caption style={{textAlign:'left',marginBottom:10}}>{tr('Локальные результаты по хронологии. Короткие тесты без достаточных данных о скорости исключены из графика.','Locally saved session history. Short sessions without reliable speed values are omitted from the chart.')}</caption>
    <thead><tr><th scope="col">{tr('Занятие','Session')}</th><th scope="col">{tr('Дата','Date')}</th><th scope="col">Net WPM</th><th scope="col">{tr('Точность','Accuracy')}</th><th scope="col">{tr('Версия расчёта','Scoring version')}</th></tr></thead>
    <tbody>{ordered.map((session,index)=><tr key={session.id}>
     <th scope="row">{index+1}</th><td>{new Date(session.endedAt).toLocaleString()}</td>
     <td>{displayWpm(session.summary.netWpm)}</td><td>{(session.summary.accuracy*100).toFixed(1)}%</td>
     <td>{session.summary.scoringVersion}</td>
    </tr>)}</tbody>
   </table>
  </div>
 </details>}</div>
 <KeyboardHeatmap nodes={keyNodes} locale={last?.locale==='en'?'en':'ru'}/>
 <div className="section-title"><h2>{tr('Рекомендации','Recommendations')}</h2></div>
 <div className="surface card">{weak.length?<div className="lesson-list">{weak.map(n=><div className="lessonline" key={n.id}><span><b>{n.sequence}</b> · {n.unit}</span><span className="small muted">{n.samples} {tr('наблюдений · оценка','observations · estimate')} {(n.mastery*100).toFixed(0)}%</span></div>)}</div>:<Placeholder>{tr('Адаптивная модель пока не имеет достаточно наблюдений. Упражняйтесь на целых текстах, чтобы накопить историю сочетаний.','Not enough observations to recommend specific sequences. Practice complete texts to build your own evidence.')}</Placeholder>}
 {error&&<p role="status">{tr('Локальная база недоступна; история может не сохраняться.','Local database unavailable; your history may not persist.')}</p>}</div>
 </section>;
}
