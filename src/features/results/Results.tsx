import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Placeholder } from '../../shared/ui/Layout';
import type { SessionRecord } from '../../application/ports/ProgressRepository';
import {displayWpm} from '../../shared/utils/formatMetrics';
import { repositories } from '../../infrastructure/di/repositories';
import { weakestSkills,type SkillNode } from '../../domain/skills/model';
export function Results() {
  const [last,setLast]=useState<SessionRecord|null>(null);
  const [weak,setWeak]=useState<SkillNode[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{let live=true;
    void repositories.progress.getRecentSessions(1).then(async sessions=>{
      if(!live)return;
      setLast(sessions[0]??null);
      if(sessions[0]) {
        const p=await repositories.skills.byLayout(sessions[0].layoutId,sessions[0].locale);
        if(live)setWeak(weakestSkills(p,sessions[0].layoutId,sessions[0].locale));
      }
    }).catch(()=>{}).finally(()=>{if(live)setLoading(false);});return ()=>{live=false;};
  },[]);
  const exportPng=()=>{
    if(!last)return;
    const canvas=document.createElement('canvas');
    canvas.width=1200;canvas.height=630;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.fillStyle='#19231f';ctx.fillRect(0,0,1200,630);
    ctx.fillStyle='#a5dfc9';ctx.font='bold 32px system-ui,sans-serif';ctx.fillText('TYKORA  /  RESULT',64,88);
    ctx.fillStyle='#ffffff';ctx.font='bold 200px system-ui,sans-serif';
    ctx.fillText(displayWpm(last.summary.netWpm,0),58,360);
    ctx.font='28px system-ui,sans-serif';ctx.fillStyle='#c9d8d2';ctx.fillText('NET WORDS PER MINUTE',70,410);
    ctx.font='bold 34px system-ui,sans-serif';ctx.fillStyle='#ffffff';
    ctx.fillText('ACCURACY  '+(last.summary.accuracy*100).toFixed(1)+'%',70,515);
    ctx.fillText('RAW WPM  '+displayWpm(last.summary.rawWpm),620,515);
    ctx.fillStyle='#a5dfc9';ctx.font='22px system-ui,sans-serif';
    ctx.fillText('Locally generated · No upload',70,585);
    const anchor=document.createElement('a');
    anchor.download='tykora-result.png';anchor.href=canvas.toDataURL('image/png');anchor.click();
  };
  return <section><PageHeader kicker="Результат / Achievement" title="Хороший ритм. Чёткий результат.">Каждый показатель получен из реального набора и сохранён только на этом устройстве.</PageHeader>
    {!last ? <div className="surface card"><Placeholder>{loading?'Загрузка результата…':'Нет сохранённого результата. Сначала завершите тест.'}</Placeholder><Link to="/practice" className="btn primary" style={{marginTop:18}}>Перейти к практике</Link></div>:
      <div className="result-layout"><div className="share-card"><div className="row spread"><strong>▦ TYKORA</strong><span className="tiny">RESULT / {new Date(last.endedAt).getFullYear()}</span></div>
        <div className="share-large">{displayWpm(last.summary.netWpm,0)}</div><div>NET WORDS PER MINUTE</div>
        <div className="share-metrics"><span>ТОЧНОСТЬ<br/><b>{(last.summary.accuracy*100).toFixed(1)}%</b></span><span>RAW WPM<br/><b>{displayWpm(last.summary.rawWpm)}</b></span></div><span className="tiny">TYPE. UNDERSTAND. MASTER.</span>
      </div><div className="surface card"><h3>Ваш разбор</h3>
        <div className="lessonline"><span>Net WPM</span><b>{displayWpm(last.summary.netWpm)}</b></div>
        <div className="lessonline"><span>Raw WPM</span><b>{displayWpm(last.summary.rawWpm)}</b></div>
        <div className="lessonline"><span>Точность всех попыток</span><b>{(last.summary.accuracy*100).toFixed(1)}%</b></div>
        <div className="lessonline"><span>Исправленные ошибки</span><b>{last.summary.correctedErrors}</b></div>
        <div className="lessonline"><span>Неисправленные ошибки</span><b>{last.summary.uncorrectedErrors}</b></div>
        <div className="lessonline"><span>Перестановки символов</span><b>{last.summary.errorTypes.transposition}</b></div>
        <div className="lessonline"><span>Продолжительность</span><b>{(last.summary.durationMs/1000).toFixed(1)} с</b></div>
        <div className="thinrule"/>
        <button type="button" className="btn secondary" onClick={exportPng}>Сохранить карточку PNG</button>
        <h3 style={{marginTop:22}}>Что тренировать дальше</h3><p className="small" style={{marginTop:9}}>{weak.length ? `Слабые сочетания: ${weak.map(x=>x.sequence).join(' · ')}. Попробуйте адаптивную практику.` : 'После нескольких полноценных сессий появятся рекомендации на основании наблюдений.'}</p>
        <Link className="btn primary" style={{marginTop:22,width:'100%'}} to="/practice">Продолжить практику ↗</Link>
      </div></div>}
  </section>;
}
