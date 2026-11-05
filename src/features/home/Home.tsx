import {useEffect,useState} from 'react';
import {useUiStore} from '../../app/store/uiStore';
import {pageCopy} from '../../shared/i18n/pageCopy';
import type {InterfaceLocale} from '../../shared/i18n/catalog';
import {Link} from 'react-router-dom';
import {Kpi,PageHeader,Placeholder} from '../../shared/ui/Layout';
import type {SessionRecord} from '../../application/ports/ProgressRepository';
import {displayWpm} from '../../shared/utils/formatMetrics';
import type {TrainingPlan} from '../../domain/plans/plan';

export function Home(){
 const locale=useUiStore(s=>s.settings.uiLocale) as InterfaceLocale;
 const en=locale==='en';
 const t=(ru:string,english:string)=>en?english:ru;
 const copy=pageCopy[locale]??pageCopy.ru;
 const [sessions,setSessions]=useState<SessionRecord[]>([]);
 const [plan,setPlan]=useState<TrainingPlan|undefined>();
 useEffect(()=>{
  let active=true;
  void import('../../infrastructure/di/repositories').then(({repositories})=>{
   if(!active)return;
   void repositories.progress.getRecentSessions(200).then(s=>{if(active)setSessions(s);}).catch(()=>{});
   void repositories.plans.get().then(p=>{if(active)setPlan(p);}).catch(()=>{});
  }).catch(()=>{});
  return ()=>{active=false;};
 },[]);
 const last=sessions[0];
 const minutes=sessions.reduce((sum,s)=>sum+s.summary.durationMs/60000,0);
 const today=new Date().toDateString();
 const minutesToday=sessions.filter(s=>new Date(s.endedAt).toDateString()===today)
  .reduce((sum,s)=>sum+s.summary.durationMs/60000,0);
 const dailyTarget=plan?.dailyMinutes??15;
 const progress=Math.min(1,minutesToday/dailyTarget);
 return <section><PageHeader kicker="TYKORA / Personal mastery" title={copy.homeTitle}>{copy.homeIntro}</PageHeader>
  <div className="welcome">
   <div className="feature">
    <div><span className="outline-pill">{copy.homeNext}</span>
     <h2>{last?t('Развивайте свой навык.','Build on your last session.'):t('Начните с вашей настоящей скорости.','Start with your real baseline.')}</h2>
     <p>{t('Только реальные измерения · Локальные данные · Без подписки','Only measured results · Local data · No subscription')}</p>
    </div>
    <Link className="btn light-button" to="/practice">{last?t('Продолжить урок','Continue lesson'):copy.practiceNext} ↗</Link>
   </div>
   <div className="surface card overview-progress">
    <div className="eyebrow">{t('Цель на сегодня','Today’s practice goal')}</div>
    <div className="day-goal-row">
     <svg className="day-goal-ring" viewBox="0 0 120 120" role="img"
      aria-label={t('Сегодня выполнено ','Completed today ')+(progress*100).toFixed(0)+'%'}>
      <circle cx="60" cy="60" r="47" fill="none" stroke="var(--border)" strokeWidth="8"/>
      <circle cx="60" cy="60" r="47" fill="none" stroke="var(--accent)" strokeWidth="8"
       strokeLinecap="round" transform="rotate(-90 60 60)" strokeDasharray={(2*Math.PI*47).toFixed(2)}
       strokeDashoffset={(2*Math.PI*47*(1-progress)).toFixed(2)}/>
      <text x="60" y="66" textAnchor="middle" fill="var(--text)" fontSize="24" fontWeight="700">{(progress*100).toFixed(0)}%</text>
     </svg>
     <div><div className="big">{minutesToday.toFixed(1)} <span>/ {dailyTarget} {t('мин','min')}</span></div>
      <p className="small">{plan?t('Из вашего личного плана','From your personal plan'):t('Пример цели: её можно изменить в Академии','Sample goal: customize it in Academy')}</p></div>
    </div>
    <p className="small">{last?t('Последняя скорость: ','Last recorded speed: ')+displayWpm(last.summary.netWpm)+' WPM':t('Первое измерение ещё не выполнено.','Your first measurement is still ahead.')}</p>
   </div>
  </div>
  <div className="section-title"><h2>{t('Ваши показатели','Your metrics')}</h2><span className="hint">{t('Только сохранённые сессии','Saved sessions only')}</span></div>
  <div className="grid3">
   <Kpi label={t('Последняя скорость','Latest speed')} value={last?displayWpm(last.summary.netWpm)+' WPM':'—'} note={last?t('Последняя завершённая сессия','Most recent completed session'):t('Нет измерений','No measurements')}/>
   <Kpi label={t('Точность','Accuracy')} value={last?(last.summary.accuracy*100).toFixed(1)+'%':'—'} note={last?t('Все попытки ввода','All typing attempts'):t('Нет завершённых тестов','No finished exercises')}/>
   <Kpi label={t('Всего практики','Total practice')} value={minutes.toFixed(1)+' '+t('мин','min')} note={t('Сумма сохранённых сессий','Total saved-session duration')}/>
  </div>
  <div className="section-title"><h2>{t('Следующий шаг','Next step')}</h2></div>
  <Placeholder>{last?t('Продолжите урок или откройте адаптивную практику. Рекомендации формируются только из ваших наблюдений.','Continue a lesson or try adaptive practice. Suggestions use your own observed sessions only.'):t('Пройдите диагностический текст, чтобы создать первую точку отсчёта.','Complete a diagnostic exercise to establish your own starting point.')}</Placeholder>
 </section>;
}
