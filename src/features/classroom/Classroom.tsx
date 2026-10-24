import {useMemo,useRef,useState,type FormEvent,type CompositionEvent,type ClipboardEvent,type ChangeEvent} from 'react';
import {PageHeader} from '../../shared/ui/Layout';
import {makeAssignment,readAssignment,readReport,csvReports,type Assignment,type ClassReport} from '../../domain/social/classroom';
import {createEngine,acceptInput,type EngineState} from '../../domain/typing/engine';
import {calculateScore} from '../../domain/metrics/metrics';
import {graphemes} from '../../domain/typing/graphemes';
import {downloadText,readSmallJson} from '../../shared/utils/download';

const initial='Точный набор текста экономит время. Спокойный ритм помогает избегать случайных ошибок. Практика становится эффективнее, когда упражнения подобраны к реальным задачам.';
export function Classroom(){
 const [tab,setTab]=useState<'student'|'teacher'>('student');
 const [title,setTitle]=useState('Урок точного набора'),[text,setText]=useState(initial),[locale,setLocale]=useState<'ru'|'en'>('ru'),[threshold,setThreshold]=useState(95);
 const [assignment,setAssignment]=useState<Assignment|null>(null);
 const [reports,setReports]=useState<ClassReport[]>([]);
 const [alias,setAlias]=useState('Ученик'),[notice,setNotice]=useState('');
 const [engine,setEngine]=useState<EngineState|null>(null),engineRef=useRef<EngineState|null>(null);
 const [composition,setComposition]=useState('');const composingRef=useRef(false);
 const make=()=>{try{const a=makeAssignment(title,text,locale,threshold/100);downloadText(`tykora-assignment-${a.id.slice(0,8)}.json`,JSON.stringify(a,null,2));setNotice('Задание создано и скачано. Отправьте файл ученикам самостоятельно.');}catch(e){setNotice(e instanceof Error?e.message:'Ошибка создания задания.');}};
 const loadAssignment=async(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];if(!file)return;
  try{const data=readAssignment(await readSmallJson(file,30_000));setAssignment(data);const next=createEngine({id:data.id,text:data.text,locale:data.locale,layoutId:data.locale==='ru'?'ru-jcuken':'en-qwerty',mode:'lesson',license:'user-provided'});engineRef.current=next;setEngine(next);setNotice('Задание загружено только в текущую вкладку.');}
  catch(e){setNotice(e instanceof Error?e.message:'Не удалось открыть файл.');}
  event.target.value='';
 };
 const importReports=async(event:ChangeEvent<HTMLInputElement>)=>{
  const files=Array.from(event.target.files??[]).slice(0,100),loaded:ClassReport[]=[];let invalid=0;
  for(const file of files){try{loaded.push(readReport(await readSmallJson(file,50_000)));}catch{invalid++;}}
  setReports(previous=>{const map=new Map(previous.map(r=>[`${r.assignmentId}:${r.alias}:${r.completedAt}`,r]));for(const r of loaded)map.set(`${r.assignmentId}:${r.alias}:${r.completedAt}`,r);return [...map.values()];});
  setNotice(`Загружено отчётов: ${loaded.length}. Отклонено: ${invalid}. Проверка подлинности офлайн-отчётов отсутствует.`);event.target.value='';
 };
 const commit=(value:string)=>{if(!engineRef.current)return;const next=acceptInput(engineRef.current,value,performance.now());engineRef.current=next;setEngine(next);};
 const onInput=(event:FormEvent<HTMLTextAreaElement>)=>{if(composingRef.current||(event.nativeEvent as InputEvent).isComposing){setComposition(event.currentTarget.value);return;}commit(event.currentTarget.value);};
 const onCompositionEnd=(event:CompositionEvent<HTMLTextAreaElement>)=>{composingRef.current=false;commit(event.currentTarget.value);setComposition('');};
 const score=engine?calculateScore(engine,engine.endedAtMs??performance.now()):null;
 const complete=!!engine?.endedAtMs&&graphemes(engine.typed).length===graphemes(assignment?.text??'').length;
 const passed=complete&&score!==null&&score.accuracy>=(assignment?.minAccuracy??1);
 const downloadReport=()=>{if(!assignment||!engine||!score||!complete)return;
  const report:ClassReport={kind:'tykora-report',version:1,assignmentId:assignment.id,assignmentTitle:assignment.title,alias:alias.trim().slice(0,40)||'Ученик',completedAt:new Date().toISOString(),complete:passed,score};
  downloadText(`tykora-report-${assignment.id.slice(0,8)}.json`,JSON.stringify(report,null,2));
  setNotice('Отчёт скачан. Передайте файл преподавателю вручную.');
 };
 const sorted=useMemo(()=>[...reports].sort((a,b)=>a.assignmentTitle.localeCompare(b.assignmentTitle)),[reports]);
 const toCsv=()=>downloadText('tykora-class-report.csv',csvReports(sorted),'text/csv;charset=utf-8');
 return <section className="social-page"><PageHeader kicker="School / Offline Classroom" title="Обучение без аккаунтов.">Преподаватель создаёт задание, ученик тренируется локально и по своему выбору передаёт отчёт. Никакой серверной базы учащихся.</PageHeader>
  <div className="social-tabs" role="group" aria-label="Выберите роль"><button className={tab==='student'?'active':''} onClick={()=>setTab('student')} type="button">Я ученик</button><button className={tab==='teacher'?'active':''} onClick={()=>setTab('teacher')} type="button">Я преподаватель</button></div>
  {tab==='teacher'?<div className="social-grid">
   <div className="surface card"><div className="eyebrow">01 / Создать задание</div><h2>Текст и требования</h2>
    <div className="social-form"><label htmlFor="class-title">Название</label><input id="class-title" maxLength={70} value={title} onChange={e=>setTitle(e.target.value)}/>
     <label htmlFor="class-locale">Язык</label><select id="class-locale" value={locale} onChange={e=>setLocale(e.target.value as 'ru'|'en')}><option value="ru">Русский</option><option value="en">English</option></select>
     <label htmlFor="class-text">Текст урока · 25–1500 символов</label><textarea id="class-text" rows={7} value={text} onChange={e=>setText(e.target.value)}/>
     <label htmlFor="class-threshold">Точность для зачёта: {threshold}%</label><input type="range" id="class-threshold" min={50} max={100} value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/>
     <button className="btn primary" type="button" onClick={make}>Скачать задание JSON</button>
    </div>
   </div>
   <div className="surface card"><div className="eyebrow">02 / Отчёты класса</div><h2>Собрать результаты</h2>
    <p className="small muted">Выберите присланные учениками файлы. Отчёты обрабатываются только в открытой вкладке; после перезагрузки исчезнут.</p>
    <label className="social-file">Импортировать отчёты JSON<input type="file" multiple accept=".json,application/json" onChange={e=>void importReports(e)}/></label>
    <div className="social-stat-grid"><div><strong>{reports.length}</strong><span>Отчётов</span></div><div><strong>{reports.filter(r=>r.complete).length}</strong><span>Зачётов (самоотчёт)</span></div></div>
    <button className="btn secondary" type="button" disabled={!reports.length} onClick={toCsv}>Экспорт CSV</button>
    <p className="small muted" style={{marginTop:16}}>Отчёты не имеют криптографической подписи и могут быть подделаны. Не используйте их для аттестации без отдельной проверки.</p>
   </div>
  </div>:<div className="surface card"><div className="eyebrow">01 / Получить упражнение</div><h2>{assignment?.title??'Загрузите задание преподавателя'}</h2>
   <label className="social-file">Открыть файл задания JSON<input type="file" accept=".json,application/json" onChange={e=>void loadAssignment(e)}/></label>
   {assignment&&engine&&<div className="class-assignment">
    <p className="small muted">Язык: {assignment.locale.toUpperCase()} · Зачёт от {(assignment.minAccuracy*100).toFixed(0)}% точности. Файл хранится только в текущей вкладке.</p>
    <div className="social-race-text">{assignment.text}</div>
    <label htmlFor="student-alias">Псевдоним для отчёта</label><input className="social-input" id="student-alias" maxLength={40} value={alias} onChange={e=>setAlias(e.target.value)}/>
    <label htmlFor="student-input">Наберите текст задания</label><textarea className="social-textarea" id="student-input" rows={3} value={composingRef.current?composition:engine.typed} disabled={engine.endedAtMs!==null}
      onInput={onInput} onPaste={(e:ClipboardEvent<HTMLTextAreaElement>)=>e.preventDefault()} onDrop={e=>e.preventDefault()}
      onBeforeInput={e=>{const t=(e.nativeEvent as InputEvent).inputType;if(t==='insertFromPaste'||t==='insertFromDrop')e.preventDefault();}}
      onCompositionStart={()=>{composingRef.current=true;setComposition(engineRef.current?.typed??'');}} onCompositionEnd={onCompositionEnd} autoComplete="off" autoCorrect="off" spellCheck={false}/>
    <div className="row spread" style={{flexWrap:'wrap',gap:12}}><strong>{score?.netWpm.toFixed(1)} WPM · {((score?.accuracy??0)*100).toFixed(1)}%</strong><span className="small muted">{complete?(passed?'Зачёт пройден':'Ниже порога точности'):'Наберите весь текст для зачёта'}</span></div>
    {complete&&<button className="btn primary" type="button" onClick={downloadReport}>Скачать мой отчёт</button>}
    <button className="btn secondary" type="button" onClick={()=>{const fresh=createEngine(engine.prompt);engineRef.current=fresh;setEngine(fresh);}}>Повторить задание</button>
   </div>}
  </div>}
  {tab==='teacher'&&sorted.length>0&&<div className="surface card" style={{marginTop:18}}><h3>Сводка импортированных результатов</h3><div className="social-table-scroll"><table className="social-table"><thead><tr><th>Задание</th><th>Псевдоним</th><th>WPM</th><th>Точность</th><th>Результат</th></tr></thead><tbody>{sorted.map((r,i)=><tr key={`${r.assignmentId}-${r.completedAt}-${i}`}><td>{r.assignmentTitle}</td><td>{r.alias}</td><td>{r.score.netWpm.toFixed(1)}</td><td>{(r.score.accuracy*100).toFixed(1)}%</td><td>{r.complete?'Зачёт':'Незачёт'}</td></tr>)}</tbody></table></div></div>}
  <p className="note" style={{marginTop:17}} role="status">{notice||'Задания и отчёты передаются только с вашего разрешения. Сетевой школьной группы и проверки личности в этой версии нет.'}</p>
 </section>;
}
