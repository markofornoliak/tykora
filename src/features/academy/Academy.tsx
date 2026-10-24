import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {PageHeader} from '../../shared/ui/Layout';
import {levels,curriculum,completionFromScores,type CourseLesson} from '../../domain/lessons/curriculum';
import {repositories} from '../../infrastructure/di/repositories';
import type {SupportedLocale} from '../../domain/content/library';
import {dailyRoutine,type TrainingPlan} from '../../domain/plans/plan';

export function Academy(){
 const [locale,setLocale]=useState<SupportedLocale>('ru');
 const [level,setLevel]=useState(1);
 const [completed,setCompleted]=useState<Set<string>>(new Set());
 const [error,setError]=useState('');
 const [targetWpm,setTargetWpm]=useState(80);
 const [horizonDays,setHorizonDays]=useState(60);
 const [dailyMinutes,setDailyMinutes]=useState<10|15|20>(15);
 const [plan,setPlan]=useState<TrainingPlan|undefined>();
 const [planStatus,setPlanStatus]=useState('');
 useEffect(()=>{let canceled=false;void repositories.progress.getRecentSessions(4000).then(rows=>{
  if(!canceled)setCompleted(completionFromScores(rows,locale));
 }).catch(()=>{if(!canceled)setError('История недоступна: прогресс не может быть загружен.');});return()=>{canceled=true;};},[locale]);
 useEffect(()=>{let active=true;void repositories.plans.get().then(p=>{if(!active||!p)return;setPlan(p);setTargetWpm(p.targetWpm);setHorizonDays(p.horizonDays);setDailyMinutes(p.dailyMinutes);}).catch(()=>{});return()=>{active=false;};},[]);
 const savePlan=async()=>{try{const next:TrainingPlan={id:'current',targetWpm,horizonDays,dailyMinutes,createdAt:new Date().toISOString(),locale};await repositories.plans.save(next);setPlan(next);setPlanStatus('Учебный план сохранён локально.');}catch{setPlanStatus('Не удалось сохранить план.');}};
 const levelData=levels[level-1];
 const selection=useMemo(()=>curriculum.filter(l=>l.level===level),[level]);
 const next=curriculum.find(l=>!completed.has(l.id))??curriculum.at(-1)!;
 const pct=Math.round(completed.size/curriculum.length*100);
 const lessonLink=(lesson:CourseLesson)=>`/practice?lesson=${encodeURIComponent(lesson.id)}&lang=${locale}`;
 return <section><PageHeader kicker="Обучение / Academy" title="Маленькие шаги. Большой навык.">124 доступных упражнения в 10 уровнях. Уроки открыты без аккаунтов и оплаты. Освоенным считается упражнение с точностью не ниже 90%.</PageHeader>
 <div className="row" style={{gap:12,marginBottom:18,flexWrap:'wrap'}}>
  <label htmlFor="academy-language" className="small">Язык упражнений</label>
  <select id="academy-language" className="chip" value={locale} onChange={e=>setLocale(e.target.value as SupportedLocale)}><option value="ru">Русский</option><option value="en">English</option></select>
  <span className="chip accent" aria-live="polite">{completed.size} / {curriculum.length} · {pct}%</span>
 </div>
 {error&&<p role="status" className="note">{error}</p>}
 <div className="course">
 <div className="surface card">
  <div className="eyebrow">Уровень {level} из 10</div>
  <h2 style={{marginTop:20}}>{locale==='ru'?levelData.titleRu:levelData.titleEn}</h2>
  <p style={{marginTop:12}}>{locale==='ru'?levelData.goalRu:levelData.goalEn} Выберите любое упражнение.</p>
  <div className="lesson-grid" aria-label="Уроки выбранного уровня">{selection.map(lesson=><Link title={`${lesson.id}: ${locale==='ru'?lesson.titleRu:lesson.titleEn}`} key={lesson.id} className={`step ${completed.has(lesson.id)?'complete':''} ${next.id===lesson.id?'now':''}`} to={lessonLink(lesson)} aria-label={`Урок ${lesson.index}, ${completed.has(lesson.id)?'освоен':'не освоен'}`}>
    {String(lesson.step).padStart(2,'0')}{completed.has(lesson.id)?' ✓':''}
  </Link>)}</div>
  <div className="section-title"><h3>Выбранный материал</h3></div>
  <div className="lesson-items">{selection.map(lesson=><div className="lesson-line" key={lesson.id}><div><b>{locale==='ru'?lesson.titleRu:lesson.titleEn}</b><p className="small muted">{lesson.durationMinutes}–{lesson.durationMinutes+2} мин · {completed.has(lesson.id)?'Освоено':'Готово к практике'}</p></div><Link className="btn secondary small-btn" to={lessonLink(lesson)}>Начать ↗</Link></div>)}</div>
 </div>
 <div className="surface card"><h3>Программа</h3><p className="small muted" style={{marginTop:9}}>Начинать можно с любого уровня. Для устойчивого навыка двигайтесь последовательно.</p>
  <div className="lesson-list">{levels.map(l=>{
   const done=curriculum.filter(x=>x.level===l.number&&completed.has(x.id)).length;
   return <button type="button" className={`level-select lessonline ${level===l.number?'level-active':''}`} key={l.id} onClick={()=>setLevel(l.number)} aria-pressed={level===l.number}>
    <span className="lessonnum">{String(l.number).padStart(2,'0')}</span><span className="grow"><b>{locale==='ru'?l.titleRu:l.titleEn}</b><span className="small">{done} / {l.count} упражнений</span></span>
   </button>;
  })}</div>
  <div className="note" style={{marginTop:15}}>Следующая рекомендация: {next.id}. Уровни не заблокированы: самостоятельный выбор важнее искусственных ограничений.</div>
  <Link to={lessonLink(next)} className="btn primary" style={{marginTop:16}}>Продолжить: {next.id} ↗</Link>
  <div className="section-title"><h3>Личный план занятий</h3></div>
  <div className="plan-controls">
   <label>Целевая скорость, WPM<input aria-label="Целевая скорость WPM" type="number" min={20} max={200} step={5} value={targetWpm} onChange={e=>setTargetWpm(Number(e.target.value))}/></label>
   <label>Дней до цели<input aria-label="Дней до цели" type="number" min={7} max={365} value={horizonDays} onChange={e=>setHorizonDays(Number(e.target.value))}/></label>
   <label>Минут в день<select aria-label="Минут в день" value={dailyMinutes} onChange={e=>setDailyMinutes(Number(e.target.value) as 10|15|20)}><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option></select></label>
  </div>
  <button type="button" className="btn secondary small-btn" onClick={()=>void savePlan()}>Сохранить план</button>
  {planStatus&&<p role="status" className="small muted">{planStatus}</p>}
  {plan&&<div className="routine"><p className="small">Ваш ежедневный шаблон: {plan.dailyMinutes} минут</p>{dailyRoutine(plan).map((part,i)=><div className="routine-item" key={part.title}><strong>{i+1}. {part.title}</strong><span>{part.minutes} мин</span><p className="small muted">{part.description}</p></div>)}<p className="small muted">Это план занятий, не обещание достижения целевой WPM за указанный срок.</p></div>}
 </div>
 </div></section>;
}
