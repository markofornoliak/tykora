import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {PageHeader} from '../../shared/ui/Layout';
import {levels,curriculum,completionFromScores,lessonProgressFromScores,reviewAvailableAt,type LessonProgress,type CourseLesson} from '../../domain/lessons/curriculum';
import {repositories} from '../../infrastructure/di/repositories';
import type {SupportedLocale} from '../../domain/content/library';
import {dailyRoutine,type TrainingPlan} from '../../domain/plans/plan';
import {useBilingual} from '../../shared/i18n/useBilingual';

export function Academy(){
 const tr=useBilingual();
 const [locale,setLocale]=useState<SupportedLocale>('ru');
 const [level,setLevel]=useState(1);
 const [completed,setCompleted]=useState<Set<string>>(new Set());
 const [lessonProgress,setLessonProgress]=useState<Map<string,LessonProgress>>(new Map());
 const [reviewWait,setReviewWait]=useState<Map<string,number>>(new Map());
 const [error,setError]=useState('');
 const [targetWpm,setTargetWpm]=useState(80);
 const [horizonDays,setHorizonDays]=useState(60);
 const [dailyMinutes,setDailyMinutes]=useState<10|15|20>(15);
 const [plan,setPlan]=useState<TrainingPlan|undefined>();
 const [planStatus,setPlanStatus]=useState('');
 useEffect(()=>{let canceled=false;void repositories.progress.getAllSessions().then(rows=>{
  if(!canceled){setCompleted(completionFromScores(rows,locale));setLessonProgress(lessonProgressFromScores(rows,locale));setReviewWait(new Map(curriculum.map(l=>[l.id,reviewAvailableAt(rows,l,locale)] as const).filter((x):x is readonly [string,number]=>x[1]!==null)));}
 }).catch(()=>{if(!canceled)setError(tr('История недоступна: прогресс не может быть загружен.','History is unavailable; progress could not be loaded.'));});return()=>{canceled=true;};},[locale]);
 useEffect(()=>{let active=true;void repositories.plans.get().then(p=>{if(!active||!p)return;setPlan(p);setTargetWpm(p.targetWpm);setHorizonDays(p.horizonDays);setDailyMinutes(p.dailyMinutes);}).catch(()=>{});return()=>{active=false;};},[]);
 const savePlan=async()=>{try{const next:TrainingPlan={id:'current',targetWpm,horizonDays,dailyMinutes,createdAt:new Date().toISOString(),locale};await repositories.plans.save(next);setPlan(next);setPlanStatus(tr('Учебный план сохранён локально.','Learning plan saved locally.'));}catch{setPlanStatus(tr('Не удалось сохранить план.','Could not save the plan.'));}};
 const levelData=levels[level-1];
 const selection=useMemo(()=>curriculum.filter(l=>l.level===level),[level]);
 const next=curriculum.find(l=>!completed.has(l.id))??curriculum.at(-1)!;
 const pct=Math.round(completed.size/curriculum.length*100);
 const lessonLink=(lesson:CourseLesson)=>{
  const status=lessonProgress.get(lesson.id);
  const review=!!status?.practice&&!status.review&&!status.mastered&&Date.now()>=(reviewWait.get(lesson.id)??Infinity);
  return `/practice?lesson=${encodeURIComponent(lesson.id)}&lang=${locale}${review?'&review=1':''}`;
 };
 const lessonStatus=(lesson:CourseLesson)=>{
  const state=lessonProgress.get(lesson.id);
  return state?.mastered?tr('Освоено','Mastered'):state?.practice&&Date.now()<(reviewWait.get(lesson.id)??Infinity)?tr('Повторение: через 2 часа или на следующую дату (UTC)','Review: in 2 hours or next UTC date'):state?.practice?tr('Ожидает контрольный текст','Review pending'):state?.review?tr('Ожидает первое прохождение','First attempt pending'):tr('Ещё не пройдено','Not attempted');
 };
 return <section><PageHeader kicker={tr('Обучение / Academy','Learning / Academy')} title={tr('Маленькие шаги. Большой навык.','Small steps. Lasting skills.')}>{tr('124 доступных упражнения в 10 уровнях. Уроки открыты без аккаунтов и оплаты. Для освоения нужны два отдельных успешных прохождения (точность ≥ 95%) на разных текстах. Прежние занятия сохраняются как первый этап.','124 exercises across ten levels, available without an account. Mastery requires two separately successful attempts on different texts, beginning at 95% accuracy. Historical sessions remain valid as first attempts.')}</PageHeader>
 <div className="row" style={{gap:12,marginBottom:18,flexWrap:'wrap'}}>
  <label htmlFor="academy-language" className="small">{tr('Язык упражнений','Exercise language')}</label>
  <select id="academy-language" className="chip" value={locale} onChange={e=>setLocale(e.target.value as SupportedLocale)}><option value="ru">{tr('Русский','Russian')}</option><option value="en">English</option></select>
  <span className="chip accent" aria-live="polite">{completed.size} / {curriculum.length} · {pct}%</span>
 </div>
 {error&&<p role="status" className="note">{error}</p>}
 <div className="course">
 <div className="surface card">
  <div className="eyebrow">{tr('Уровень','Level')} {level} {tr('из','of')} 10</div>
  <h2 style={{marginTop:20}}>{locale==='ru'?levelData.titleRu:levelData.titleEn}</h2>
  <p style={{marginTop:12}}>{locale==='ru'?levelData.goalRu:levelData.goalEn} {tr('Выберите любое упражнение.','Choose any exercise.')}</p>
  <div className="lesson-grid" aria-label={tr('Уроки выбранного уровня','Lessons in selected level')}>{selection.map(lesson=><Link title={`${lesson.id}: ${locale==='ru'?lesson.titleRu:lesson.titleEn}`} key={lesson.id} className={`step ${completed.has(lesson.id)?'complete':''} ${next.id===lesson.id?'now':''}`} to={lessonLink(lesson)} aria-label={`${tr('Урок','Lesson')} ${lesson.index}, ${lessonStatus(lesson)}`}>
    {String(lesson.step).padStart(2,'0')}{completed.has(lesson.id)?' ✓':''}
  </Link>)}</div>
  <div className="section-title"><h3>{tr('Выбранный материал','Selected material')}</h3></div>
  <div className="lesson-items">{selection.map(lesson=><div className="lesson-line" key={lesson.id}><div><b>{locale==='ru'?lesson.titleRu:lesson.titleEn}</b><p className="small muted">{lesson.durationMinutes}–{lesson.durationMinutes+2} {tr('мин','min')} · {lessonStatus(lesson)}</p></div><Link className="btn secondary small-btn" to={lessonLink(lesson)}>{lessonProgress.get(lesson.id)?.practice&&!completed.has(lesson.id)&&Date.now()>=(reviewWait.get(lesson.id)??Infinity)?tr('Контрольный текст ↗','Review text ↗'):tr('Начать ↗','Start ↗')}</Link></div>)}</div>
 </div>
 <div className="surface card"><h3>{tr('Программа','Curriculum')}</h3><p className="small muted" style={{marginTop:9}}>{tr('Начинать можно с любого уровня. Для устойчивого навыка двигайтесь последовательно.','You may begin at any level. For consistent practice, progress through the course step by step.')}</p>
  <div className="lesson-list">{levels.map(l=>{
   const done=curriculum.filter(x=>x.level===l.number&&completed.has(x.id)).length;
   return <button type="button" className={`level-select lessonline ${level===l.number?'level-active':''}`} key={l.id} onClick={()=>setLevel(l.number)} aria-pressed={level===l.number}>
    <span className="lessonnum">{String(l.number).padStart(2,'0')}</span><span className="grow"><b>{locale==='ru'?l.titleRu:l.titleEn}</b><span className="small">{done} / {l.count} {tr('упражнений','exercises')}</span></span>
   </button>;
  })}</div>
  <div className="note" style={{marginTop:15}}>{tr('Следующая рекомендация: ','Recommended next: ')}{next.id}. {tr('Уровни не заблокированы: самостоятельный выбор важнее искусственных ограничений.','Levels remain unlocked; you choose your own learning path.')}</div>
  <Link to={lessonLink(next)} className="btn primary" style={{marginTop:16}}>{tr('Продолжить: ','Continue: ')}{next.id} ↗</Link>
  <div className="section-title"><h3>{tr('Личный план занятий','Personal practice plan')}</h3></div>
  <div className="plan-controls">
   <label>{tr('Целевая скорость, WPM','Target speed, WPM')}<input aria-label={tr('Целевая скорость WPM','Target WPM')} type="number" min={20} max={200} step={5} value={targetWpm} onChange={e=>setTargetWpm(Number(e.target.value))}/></label>
   <label>{tr('Дней до цели','Days to target')}<input aria-label={tr('Дней до цели','Days to target')} type="number" min={7} max={365} value={horizonDays} onChange={e=>setHorizonDays(Number(e.target.value))}/></label>
   <label>{tr('Минут в день','Minutes daily')}<select aria-label={tr('Минут в день','Minutes daily')} value={dailyMinutes} onChange={e=>setDailyMinutes(Number(e.target.value) as 10|15|20)}><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option></select></label>
  </div>
  <button type="button" className="btn secondary small-btn" onClick={()=>void savePlan()}>{tr('Сохранить план','Save plan')}</button>
  {planStatus&&<p role="status" className="small muted">{planStatus}</p>}
  {plan&&<div className="routine"><p className="small">{tr('Ваш ежедневный шаблон: ','Your daily plan: ')}{plan.dailyMinutes} {tr('минут','minutes')}</p>{dailyRoutine(plan).map((part,i)=><div className="routine-item" key={part.title}><strong>{i+1}. {part.title}</strong><span>{part.minutes} {tr('мин','min')}</span><p className="small muted">{part.description}</p></div>)}<p className="small muted">{tr('Это план занятий, не обещание достижения целевой WPM за указанный срок.','This is a practice schedule, not a guarantee that you will reach a certain WPM by a given date.')}</p></div>}
 </div>
 </div></section>;
}
