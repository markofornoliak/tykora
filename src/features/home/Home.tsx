import {useEffect,useState} from 'react';
import {useUiStore} from '../../app/store/uiStore';
import {pageCopy} from '../../shared/i18n/pageCopy';
import type {InterfaceLocale} from '../../shared/i18n/catalog';
import {Link} from 'react-router-dom';
import {Kpi,PageHeader,Placeholder} from '../../shared/ui/Layout';
import {repositories} from '../../infrastructure/di/repositories';
import type {SessionRecord} from '../../application/ports/ProgressRepository';
import {displayWpm} from '../../shared/utils/formatMetrics';
import type {TrainingPlan} from '../../domain/plans/plan';

export function Home(){
 const locale=useUiStore(s=>s.settings.uiLocale) as InterfaceLocale;
 const copy=pageCopy[locale]??pageCopy.ru;
 const [sessions,setSessions]=useState<SessionRecord[]>([]);
 const [plan,setPlan]=useState<TrainingPlan|undefined>();
 useEffect(()=>{
  let active=true;
  void repositories.progress.getRecentSessions(200).then(s=>{if(active)setSessions(s);}).catch(()=>{});
  void repositories.plans.get().then(p=>{if(active)setPlan(p);}).catch(()=>{});
  return ()=>{active=false;};
 },[]);
 const last=sessions[0];
 const minutes=sessions.reduce((sum,s)=>sum+s.summary.durationMs/60000,0);
 const target=plan?.targetWpm??80;
 return <section><PageHeader kicker="TYKORA / Personal mastery" title={copy.homeTitle}>{copy.homeIntro}</PageHeader>
  <div className="welcome"><div className="feature"><div><span className="outline-pill">{copy.homeNext}</span><h2>{last?'Развивайте вашу скорость.':'Начнём с вашей настоящей скорости.'}</h2><p>Настоящие измерения · Без регистрации · Без платных функций</p></div><Link className="btn light-button" to="/practice">{last?'Продолжить практику':copy.practiceNext} ↗</Link></div>
  <div className="surface card overview-progress"><div className="eyebrow">Личная цель</div><div className="big">{target} <span>WPM</span></div><p className="small">{plan?`Ваш план · ${plan.dailyMinutes} минут в день`:'Пример цели · 15 минут в день'}</p><div className="progress" style={{marginTop:24}}><i style={{width:`${Math.min(100,(last?.summary.netWpm??0)/target*100)}%`}}/></div><p className="small" style={{marginTop:12}}>{last?`${displayWpm(last.summary.netWpm)} из ${target} WPM — ${plan?'ваша цель':'иллюстративная цель'}`:'Первый диагностический тест ещё не пройден.'}</p></div></div>
  <div className="section-title"><h2>Ваши показатели</h2><span className="hint">Ваши реальные данные</span></div>
  <div className="grid3"><Kpi label="Последняя скорость" value={last?`${displayWpm(last.summary.netWpm)} WPM`:'—'} note={last?'Последняя завершённая сессия':'Пока нет измерений'}/><Kpi label="Точность" value={last?`${(last.summary.accuracy*100).toFixed(1)}%`:'—'} note={last?'Все попытки ввода':'Нет завершённых тестов'}/><Kpi label="Время практики" value={`${minutes.toFixed(1)} мин`} note="Сумма сохранённых сессий"/></div>
  <div className="section-title"><h2>Что дальше?</h2></div><Placeholder>Начните с диагностического текста, затем переключитесь на «Адаптивная практика». Слабые сочетания будут учитываться по мере накопления наблюдений.</Placeholder>
 </section>;
}
