import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Placeholder } from '../../shared/ui/Layout';
import type { SessionRecord } from '../../application/ports/ProgressRepository';
import {displayWpm} from '../../shared/utils/formatMetrics';
import { repositories } from '../../infrastructure/di/repositories';
import { weakestSkills,type SkillNode } from '../../domain/skills/model';
import {useBilingual} from '../../shared/i18n/useBilingual';
function savePngCard(record:SessionRecord,english:boolean):void{
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=630;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const css=getComputedStyle(document.documentElement);
 const bg=css.getPropertyValue('--bg').trim()||'white';
 const fg=css.getPropertyValue('--text').trim()||'black';
 const accent=css.getPropertyValue('--accent').trim()||fg;
 ctx.fillStyle=bg;ctx.fillRect(0,0,1200,630);
 ctx.fillStyle=accent;ctx.fillRect(76,80,11,480);
 ctx.fillStyle=fg;ctx.font='700 39px system-ui, sans-serif';ctx.fillText('TYKORA',120,142);
 ctx.font='600 24px system-ui, sans-serif';ctx.fillText(english?'PERSONAL TYPING RESULT':'ЛИЧНЫЙ РЕЗУЛЬТАТ',120,200);
 ctx.font='800 162px system-ui, sans-serif';ctx.fillText(displayWpm(record.summary.netWpm,0),110,390);
 ctx.font='600 29px system-ui, sans-serif';ctx.fillText('NET WPM',120,440);
 ctx.font='600 33px system-ui, sans-serif';ctx.fillText((english?'Accuracy: ':'Точность: ')+(record.summary.accuracy*100).toFixed(1)+'%',120,517);
 ctx.font='400 19px system-ui, sans-serif';ctx.fillText((english?'Local result · ':'Локальный результат · ')+new Date(record.endedAt).toLocaleDateString(english?'en-US':'ru-RU'),120,562);
 const a=document.createElement('a');a.download='tykora-result.png';a.href=canvas.toDataURL('image/png');a.click();
}
export function Results() {
  const tr=useBilingual();
  const [last,setLast]=useState<SessionRecord|null>(null);
  const [weak,setWeak]=useState<SkillNode[]>([]);
  const [loading,setLoading]=useState(true);
  const [comparable,setComparable]=useState<{average:number;count:number}|null>(null);
  useEffect(()=>{let live=true;
    void repositories.progress.getRecentSessions(30).then(async sessions=>{
      if(!live)return;
      setLast(sessions[0]??null);
      if(sessions[0]) {
        const current=sessions[0];
        const values=sessions.slice(1).filter(s=>s.layoutId===current.layoutId&&s.locale===current.locale&&s.summary.scoringVersion===current.summary.scoringVersion&&s.summary.netWpm!==null).map(s=>s.summary.netWpm as number);
        if(values.length)setComparable({average:values.reduce((a,b)=>a+b,0)/values.length,count:values.length});
        const p=await repositories.skills.byLayout(current.layoutId,current.locale);
        if(live)setWeak(weakestSkills(p,sessions[0].layoutId,sessions[0].locale));
      }
    }).catch(()=>{}).finally(()=>{if(live)setLoading(false);});return ()=>{live=false;};
  },[]);
  const timeline=(last?.timeline??[]).filter(p=>Number.isInteger(p.second)&&p.second>=0
   &&p.netWpm!==null&&Number.isFinite(p.netWpm)&&p.netWpm>=0&&p.netWpm<=2000
   &&Number.isFinite(p.accuracy)&&p.accuracy>=0&&p.accuracy<=1).slice(0,3600);
  const maxWpm=Math.max(10,...timeline.map(p=>p.netWpm??0));
  const maxSecond=Math.max(1,...timeline.map(p=>p.second));
  const points=timeline.map(p=>`${20+p.second/maxSecond*560},${155-(p.netWpm??0)/maxWpm*130}`).join(' ');
  return <section><PageHeader kicker={tr('Результат / Achievement','Result / Achievement')} title={tr('Хороший ритм. Чёткий результат.','Clear rhythm. Measured result.')}>{tr('Каждый показатель получен из реального набора и сохранён только на этом устройстве.','Every metric comes from your own typing and is stored on this device only.')}</PageHeader>
    {!last ? <div className="surface card"><Placeholder>{loading?tr('Загрузка результата…','Loading result…'):tr('Нет сохранённого результата. Сначала завершите тест.','No saved result. Finish an exercise first.')}</Placeholder><Link to="/practice" className="btn primary" style={{marginTop:18}}>{tr('Перейти к практике','Go to practice')}</Link></div>:
      <div className="result-layout"><div className="share-card"><div className="row spread"><strong>▦ TYKORA</strong><span className="tiny">RESULT / {new Date(last.endedAt).getFullYear()}</span></div>
        <div className="share-large">{displayWpm(last.summary.netWpm,0)}</div><div>NET WORDS PER MINUTE</div>
        <div className="share-metrics"><span>{tr('ТОЧНОСТЬ','ACCURACY')}<br/><b>{(last.summary.accuracy*100).toFixed(1)}%</b></span><span>RAW WPM<br/><b>{displayWpm(last.summary.rawWpm)}</b></span></div><span className="tiny">TYPE. UNDERSTAND. MASTER.</span>
        <button className="btn secondary" type="button" onClick={()=>savePngCard(last,!!(tr('','EN')))}> {tr('Сохранить PNG-карточку (офлайн)','Save PNG card (offline)')}</button>
      </div><div className="surface card"><h3>{tr('Ваш разбор','Your breakdown')}</h3>
        <div className="lessonline"><span>Net WPM</span><b>{displayWpm(last.summary.netWpm)}</b></div>
        <div className="lessonline"><span>Raw WPM</span><b>{displayWpm(last.summary.rawWpm)}</b></div>
        {comparable&&last.summary.netWpm!==null&&<div className="lessonline"><span>{tr('Среднее прошлых','Average of prior')} {comparable.count} {tr('сопоставимых сессий','comparable sessions')}</span><b>{comparable.average.toFixed(1)} WPM</b></div>}
        <div className="lessonline"><span>{tr('Точность всех попыток','Accuracy across attempts')}</span><b>{(last.summary.accuracy*100).toFixed(1)}%</b></div>
        <div className="lessonline"><span>{tr('Исправленные ошибки','Corrected mistakes')}</span><b>{last.summary.correctedErrors}</b></div>
        <div className="lessonline"><span>{tr('Неисправленные ошибки','Uncorrected mistakes')}</span><b>{last.summary.uncorrectedErrors}</b></div>
        <div className="lessonline"><span>{tr('Перестановки символов','Transpositions')}</span><b>{last.summary.errorTypes.transposition}</b></div>
        <div className="lessonline"><span>{tr('Продолжительность','Duration')}</span><b>{(last.summary.durationMs/1000).toFixed(1)} {tr('с','s')}</b></div>
        <div className="thinrule"/>
        <h3>{tr('Что тренировать дальше','What to practice next')}</h3><p className="small" style={{marginTop:9}}>{weak.length ? tr('Наблюдаемые сложные сочетания (до пяти): ','Observed difficult sequences (up to five): ')+weak.slice(0,5).map(x=>x.sequence).join(' · ')+tr('. Попробуйте адаптивную практику.','. Try adaptive practice.') : tr('После нескольких полноценных сессий появятся рекомендации на основании наблюдений.','After more complete sessions, recommendations will use your observations.')}</p>
        {timeline.length>=2?<section aria-label={tr('Скорость набора по секундам','Typing speed by second')}>
          <h3>{tr('Наблюдаемая скорость по секундам','Observed speed by second')}</h3>
          <svg className="chart" viewBox="0 0 600 180" role="img" aria-label={tr('Наблюдаемые значения Net WPM по прошедшим секундам','Observed Net WPM across elapsed seconds')}>
            <line x1="20" y1="155" x2="580" y2="155" stroke="var(--border)"/>
            <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round"/>
          </svg>
          <details><summary>{tr('Таблица наблюдений по секундам','Per-second observations table')} ({timeline.length})</summary>
          <div style={{overflowX:'auto'}}><table className="social-table"><caption>{tr('Фактические сохранённые интервальные значения, а не восстановление итогового WPM.','Recorded interval values, not reconstructed from the final WPM.')}</caption>
          <thead><tr><th scope="col">{tr('Секунда','Second')}</th><th scope="col">Net WPM</th><th scope="col">{tr('Точность','Accuracy')}</th><th scope="col">{tr('Попыток','Attempts')}</th></tr></thead>
          <tbody>{timeline.map(point=><tr key={point.second}><th scope="row">{point.second}</th><td>{point.netWpm?.toFixed(1)??'—'}</td><td>{(point.accuracy*100).toFixed(1)}%</td><td>{point.attempts}</td></tr>)}</tbody></table></div></details>
         </section>:<p className="small muted" style={{marginTop:10}}>{tr('Нет достоверного временного ряда: он доступен только для новых сессий с достаточной длительностью, без реконструкции старых данных.','No real time series available. Only sufficiently long new sessions record interval samples; older history is never reconstructed.')}</p>}
        <Link className="btn primary" style={{marginTop:22,width:'100%'}} to="/practice">{tr('Продолжить практику','Continue practice')} ↗</Link>
      </div></div>}
  </section>;
}
