import {useMemo,useRef,useState,type FormEvent,type CompositionEvent,type ClipboardEvent,type ChangeEvent} from 'react';
import {PageHeader} from '../../shared/ui/Layout';
import {makeAssignment,readAssignment,readReport,csvReports,type Assignment,type ClassReport} from '../../domain/social/classroom';
import {createEngine,acceptInput,type EngineState} from '../../domain/typing/engine';
import {calculateScore} from '../../domain/metrics/metrics';
import {graphemes} from '../../domain/typing/graphemes';
import {downloadText,readSmallJson} from '../../shared/utils/download';
import {useBilingual} from '../../shared/i18n/useBilingual';

const initial='Точный набор текста экономит время. Спокойный ритм помогает избегать случайных ошибок. Практика становится эффективнее, когда упражнения подобраны к реальным задачам.';
export function Classroom(){
 const tr=useBilingual();
 const [tab,setTab]=useState<'student'|'teacher'>('student');
 const [title,setTitle]=useState('Урок точного набора'),[text,setText]=useState(initial),[locale,setLocale]=useState<'ru'|'en'>('ru'),[threshold,setThreshold]=useState(95);
 const [assignment,setAssignment]=useState<Assignment|null>(null);
 const [reports,setReports]=useState<ClassReport[]>([]);
 const [alias,setAlias]=useState('Ученик'),[notice,setNotice]=useState('');
 const [engine,setEngine]=useState<EngineState|null>(null),engineRef=useRef<EngineState|null>(null);
 const [composition,setComposition]=useState('');const composingRef=useRef(false);
 const make=()=>{try{const a=makeAssignment(title,text,locale,threshold/100);downloadText(`tykora-assignment-${a.id.slice(0,8)}.json`,JSON.stringify(a,null,2));setNotice(tr('Задание создано и скачано. Отправьте файл ученикам самостоятельно.','Assignment created and downloaded. Send the file to students yourself.'));}catch(e){setNotice(e instanceof Error?e.message:tr('Ошибка создания задания.','Could not create the assignment.'));}};
 const loadAssignment=async(event:ChangeEvent<HTMLInputElement>)=>{
  const file=event.target.files?.[0];if(!file)return;
  try{const data=readAssignment(await readSmallJson(file,30_000));setAssignment(data);const next=createEngine({id:data.id,text:data.text,locale:data.locale,layoutId:data.locale==='ru'?'ru-jcuken':'en-qwerty',mode:'lesson',license:'user-provided'});engineRef.current=next;setEngine(next);setNotice(tr('Задание загружено только в текущую вкладку.','Assignment loaded in this tab only.'));}
  catch(e){setNotice(e instanceof Error?e.message:tr('Не удалось открыть файл.','Could not open the file.'));}
  event.target.value='';
 };
 const importReports=async(event:ChangeEvent<HTMLInputElement>)=>{
  const files=Array.from(event.target.files??[]).slice(0,100),loaded:ClassReport[]=[];let invalid=0;
  for(const file of files){try{loaded.push(readReport(await readSmallJson(file,50_000)));}catch{invalid++;}}
  setReports(previous=>{const map=new Map(previous.map(r=>[`${r.assignmentId}:${r.alias}:${r.completedAt}`,r]));for(const r of loaded)map.set(`${r.assignmentId}:${r.alias}:${r.completedAt}`,r);return [...map.values()];});
  setNotice(tr(`Загружено отчётов: ${loaded.length}. Отклонено: ${invalid}. Проверка подлинности офлайн-отчётов отсутствует.`,`Reports loaded: ${loaded.length}; rejected: ${invalid}. Offline reports have no authenticity verification.`));event.target.value='';
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
  setNotice(tr('Отчёт скачан. Передайте файл преподавателю вручную.','Report downloaded. Send the file to your teacher yourself.'));
 };
 const sorted=useMemo(()=>[...reports].sort((a,b)=>a.assignmentTitle.localeCompare(b.assignmentTitle)),[reports]);
 const toCsv=()=>downloadText('tykora-class-report.csv',csvReports(sorted),'text/csv;charset=utf-8');
 return <section className="social-page"><PageHeader kicker="School / Offline Classroom" title={tr('Обучение без аккаунтов.','Learning without accounts.')}>{tr('Преподаватель создаёт задание, ученик тренируется локально и по своему выбору передаёт отчёт. Никакой серверной базы учащихся.','The teacher creates an assignment; students practice locally and choose when to share reports. There is no server-side student database.')}</PageHeader>
  <div className="social-tabs" role="group" aria-label={tr('Выберите роль','Choose a role')}><button className={tab==='student'?'active':''} onClick={()=>setTab('student')} type="button">{tr('Я ученик','I am a student')}</button><button className={tab==='teacher'?'active':''} onClick={()=>setTab('teacher')} type="button">{tr('Я преподаватель','I am a teacher')}</button></div>
  {tab==='teacher'?<div className="social-grid">
   <div className="surface card"><div className="eyebrow">{tr('01 / Создать задание','01 / Create assignment')}</div><h2>{tr('Текст и требования','Text and requirements')}</h2>
    <div className="social-form"><label htmlFor="class-title">{tr('Название','Title')}</label><input id="class-title" maxLength={70} value={title} onChange={e=>setTitle(e.target.value)}/>
     <label htmlFor="class-locale">{tr('Язык','Language')}</label><select id="class-locale" value={locale} onChange={e=>setLocale(e.target.value as 'ru'|'en')}><option value="ru">{tr('Русский','Russian')}</option><option value="en">English</option></select>
     <label htmlFor="class-text">{tr('Текст урока · 25–1500 символов','Lesson text · 25–1500 characters')}</label><textarea id="class-text" rows={7} value={text} onChange={e=>setText(e.target.value)}/>
     <label htmlFor="class-threshold">{tr('Точность для зачёта: ','Minimum accuracy: ')}{threshold}%</label><input type="range" id="class-threshold" min={50} max={100} value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/>
     <button className="btn primary" type="button" onClick={make}>{tr('Скачать задание JSON','Download assignment JSON')}</button>
    </div>
   </div>
   <div className="surface card"><div className="eyebrow">{tr('02 / Отчёты класса','02 / Class reports')}</div><h2>{tr('Собрать результаты','Collect results')}</h2>
    <p className="small muted">{tr('Выберите присланные учениками файлы. Отчёты обрабатываются только в открытой вкладке; после перезагрузки исчезнут.','Choose reports submitted by students. Reports are processed in this tab only and disappear after reloading.')}</p>
    <label className="social-file">{tr('Импортировать отчёты JSON','Import JSON reports')}<input type="file" multiple accept=".json,application/json" onChange={e=>void importReports(e)}/></label>
    <div className="social-stat-grid"><div><strong>{reports.length}</strong><span>{tr('Отчётов','Reports')}</span></div><div><strong>{reports.filter(r=>r.complete).length}</strong><span>{tr('Зачётов (самоотчёт)','Passed (self-reported)')}</span></div></div>
    <button className="btn secondary" type="button" disabled={!reports.length} onClick={toCsv}>{tr('Экспорт CSV','Export CSV')}</button>
    <p className="small muted" style={{marginTop:16}}>{tr('Отчёты не имеют криптографической подписи и могут быть подделаны. Не используйте их для аттестации без отдельной проверки.','Reports are not cryptographically signed and may be forged. Do not use them for certification without independent verification.')}</p>
   </div>
  </div>:<div className="surface card"><div className="eyebrow">{tr('01 / Получить упражнение','01 / Receive assignment')}</div><h2>{assignment?.title??tr('Загрузите задание преподавателя','Load a teacher assignment')}</h2>
   <label className="social-file">{tr('Открыть файл задания JSON','Open assignment JSON')}<input type="file" accept=".json,application/json" onChange={e=>void loadAssignment(e)}/></label>
   {assignment&&engine&&<div className="class-assignment">
    <p className="small muted">{tr('Язык: ','Language: ')}{assignment.locale.toUpperCase()} · {tr('Зачёт от ','Pass threshold ')}{(assignment.minAccuracy*100).toFixed(0)}% {tr('точности. Файл хранится только в текущей вкладке.','accuracy. The file stays in this tab only.')}</p>
    <div className="social-race-text">{assignment.text}</div>
    <label htmlFor="student-alias">{tr('Псевдоним для отчёта','Report nickname')}</label><input className="social-input" id="student-alias" maxLength={40} value={alias} onChange={e=>setAlias(e.target.value)}/>
    <label htmlFor="student-input">{tr('Наберите текст задания','Type the assignment text')}</label><textarea className="social-textarea" id="student-input" rows={3} value={composingRef.current?composition:engine.typed} disabled={engine.endedAtMs!==null}
      onInput={onInput} onPaste={(e:ClipboardEvent<HTMLTextAreaElement>)=>e.preventDefault()} onDrop={e=>e.preventDefault()}
      onBeforeInput={e=>{const t=(e.nativeEvent as InputEvent).inputType;if(t==='insertFromPaste'||t==='insertFromDrop')e.preventDefault();}}
      onCompositionStart={()=>{composingRef.current=true;setComposition(engineRef.current?.typed??'');}} onCompositionEnd={onCompositionEnd} autoComplete="off" autoCorrect="off" spellCheck={false}/>
    <div className="row spread" style={{flexWrap:'wrap',gap:12}}><strong>{score?.netWpm.toFixed(1)} WPM · {((score?.accuracy??0)*100).toFixed(1)}%</strong><span className="small muted">{complete?(passed?tr('Зачёт пройден','Passed'):tr('Ниже порога точности','Below accuracy threshold')):tr('Наберите весь текст для зачёта','Type the entire text to complete the assignment')}</span></div>
    {complete&&<button className="btn primary" type="button" onClick={downloadReport}>{tr('Скачать мой отчёт','Download my report')}</button>}
    <button className="btn secondary" type="button" onClick={()=>{const fresh=createEngine(engine.prompt);engineRef.current=fresh;setEngine(fresh);}}>{tr('Повторить задание','Restart assignment')}</button>
   </div>}
  </div>}
  {tab==='teacher'&&sorted.length>0&&<div className="surface card" style={{marginTop:18}}><h3>{tr('Сводка импортированных результатов','Imported results summary')}</h3><div className="social-table-scroll"><table className="social-table"><thead><tr><th>{tr('Задание','Assignment')}</th><th>{tr('Псевдоним','Nickname')}</th><th>WPM</th><th>{tr('Точность','Accuracy')}</th><th>{tr('Результат','Result')}</th></tr></thead><tbody>{sorted.map((r,i)=><tr key={`${r.assignmentId}-${r.completedAt}-${i}`}><td>{r.assignmentTitle}</td><td>{r.alias}</td><td>{r.score.netWpm.toFixed(1)}</td><td>{(r.score.accuracy*100).toFixed(1)}%</td><td>{r.complete?tr('Зачёт','Pass'):tr('Незачёт','Fail')}</td></tr>)}</tbody></table></div></div>}
  <p className="note" style={{marginTop:17}} role="status">{notice||tr('Задания и отчёты передаются только с вашего разрешения. Сетевой школьной группы и проверки личности в этой версии нет.','Assignments and reports are shared only with your consent. There is no school network group or identity verification in this version.')}</p>
 </section>;
}
