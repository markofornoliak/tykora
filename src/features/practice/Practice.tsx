import {useEffect,useMemo,useRef,useState,type FormEvent,type CompositionEvent,type ClipboardEvent,type DragEvent} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {PageHeader} from '../../shared/ui/Layout';
import {useUiStore} from '../../app/store/uiStore';
import {KeyboardPreview} from './components/KeyboardPreview';
import {TargetDisplay} from '../../shared/ui/TargetDisplay';
import {useTranslation} from 'react-i18next';
import {pageCopy} from '../../shared/i18n/pageCopy';
import type {InterfaceLocale} from '../../shared/i18n/catalog';
import {diagnostics,words} from '../../domain/content/prompts';
import {getPassages,type SupportedLocale,type TrackId} from '../../domain/content/library';
import {curriculum,findLesson,lessonPrompt} from '../../domain/lessons/curriculum';
import {promptForMode,seedFromDate,modeLabels,type ModeId} from '../../domain/modes/modes';
import {createEngine,acceptInput,currentPosition,finishEngine,type EngineState,type InputSource} from '../../domain/typing/engine';
import {graphemes} from '../../domain/typing/graphemes';
import {normalizedEventTimestamp} from '../../domain/typing/eventTime';
import {elapsedMs} from '../../domain/metrics/metrics';
import {calculateScoreV2,type ScoreV2} from '../../domain/metrics/metricsV2';
import {displayWpm} from '../../shared/utils/formatMetrics';
import {scoreAsync} from '../../infrastructure/workers/scoreAsync';
import {generateDrill} from '../../domain/skills/generator';
import {ESTIMATOR_VERSION} from '../../domain/skills/model';
import {repositories} from '../../infrastructure/di/repositories';
import type {TypingPrompt} from '../../domain/typing/contracts';

const layouts:Record<SupportedLocale,readonly {id:string;label:string}[]>={
 ru:[{id:'ru-jcuken',label:'Русская · ЙЦУКЕН'},{id:'ru-phonetic',label:'Русская · фонетическая'}],
 en:[{id:'en-qwerty',label:'English · QWERTY'},{id:'en-qwertz',label:'Deutsch · QWERTZ'},{id:'en-azerty',label:'Français · AZERTY'},{id:'en-dvorak',label:'English · Dvorak'},{id:'en-colemak',label:'English · Colemak'},{id:'en-workman',label:'English · Workman'}]
};
type Selection=ModeId|'lesson';
const tracks:readonly {id:TrackId;label:string}[]=[
 {id:'general',label:'Общие тексты'},{id:'code-python',label:'Python'},{id:'code-cpp',label:'C++'},
 {id:'code-js',label:'JavaScript'},{id:'business',label:'Деловые тексты'},
 {id:'finance',label:'Финансы'},{id:'medical',label:'Медицина'},{id:'legal',label:'Право'}
];
export function Practice(){
 const {t}=useTranslation();
 const interfaceLocale=useUiStore(s=>s.settings.uiLocale) as InterfaceLocale;
 const copy=pageCopy[interfaceLocale]??pageCopy.ru;
 const [query]=useSearchParams();const lessonId=query.get('lesson')??'';
 const lessonVariant=query.get('review')==='1'?'review':'practice';
 const initialLocale=query.get('lang')==='en'?'en':'ru';
 const [language,setLanguage]=useState<SupportedLocale>(initialLocale);
 const [layoutId,setLayoutId]=useState(initialLocale==='ru'?'ru-jcuken':'en-qwerty');
 const [mode,setMode]=useState<Selection>(lessonId?'lesson':'diagnostic');
 const [count,setCount]=useState(25);const [duration,setDuration]=useState(60);
 const [track,setTrack]=useState<TrackId>('general');
 const [customText,setCustomText]=useState('');
 const [lessonTitle,setLessonTitle]=useState('');
 const [prompt,setPrompt]=useState<TypingPrompt>(diagnostics[initialLocale]);
 const sessionRef=useRef<EngineState>(createEngine(diagnostics[initialLocale]));
 const [session,setSession]=useState<EngineState>(sessionRef.current);
 const [compositionDraft,setCompositionDraft]=useState('');
 const [focus,setFocus]=useState(false);const [now,setNow]=useState(0);
 const [saveNotice,setSaveNotice]=useState('');
 const [persistence,setPersistence]=useState<'idle'|'saving'|'saved'|'failed'>('idle');
 const [finalScore,setFinalScore]=useState<ScoreV2|null>(null);
 const [lastCode,setLastCode]=useState('');
 const composing=useRef(false);const savedId=useRef('');
 const recentWords=useRef<string[]>([]);const inputRef=useRef<HTMLTextAreaElement>(null);
 const requestId=useRef(0);const navigate=useNavigate();
 const settings=useUiStore(s=>s.settings),updateSettings=useUiStore(s=>s.updateSettings);

 const reset=(nextPrompt:TypingPrompt=prompt)=>{
  const fresh=createEngine(nextPrompt);sessionRef.current=fresh;setSession(fresh);setPrompt(nextPrompt);
  savedId.current='';setNow(0);setSaveNotice('');setPersistence('idle');setFinalScore(null);
  composing.current=false;setCompositionDraft('');
  requestAnimationFrame(()=>inputRef.current?.focus());
 };
 const prepare=async(nextMode:Selection,nextLanguage:SupportedLocale=language,nextLayout=layoutId,nextTrack=track,nextCount=count,nextDuration=duration,content=customText,chosenLesson=lessonId)=>{
  const thisRequest=++requestId.current;
  setMode(nextMode);setLanguage(nextLanguage);setLayoutId(nextLayout);
  const effectiveCount=nextMode==='adaptive'?Math.min(50,nextCount):nextCount;
  setTrack(nextTrack);setCount(effectiveCount);setDuration(nextDuration);
  setLessonTitle('');
  const diagnostic={...diagnostics[nextLanguage],layoutId:nextLayout};
  if(nextMode==='diagnostic'){reset(diagnostic);return;}
  if(nextMode==='lesson') {
   const l=findLesson(chosenLesson)??curriculum[0];
   setLessonTitle(`${nextLanguage==='ru'?l.titleRu:l.titleEn} · ${lessonVariant==='review'?'Контрольный текст':'Практика'}`);
   reset(lessonPrompt(l,nextLanguage,nextLayout,lessonVariant));return;
  }
  if(nextMode==='adaptive'){
   let skillNodes={};
   try{skillNodes=await repositories.skills.byLayout(nextLayout,nextLanguage);}catch{setSaveNotice('История навыка недоступна.');}
   if(requestId.current!==thisRequest)return;
   const seed=Date.now(); // model is sampled at the same instant as its deterministic seed
   const text=generateDrill(skillNodes,words[nextLanguage],{locale:nextLanguage,layoutId:nextLayout,seed,nowMs:seed,wordCount:effectiveCount,recentWords:recentWords.current});
   recentWords.current=text.split(' ');
   reset({...diagnostic,id:`adaptive-${ESTIMATOR_VERSION}-${nextLanguage}-${seed}`,text,mode:'lesson'});return;
  }
  try{
   const d=new Date();
   const localDate=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
   const seed=nextMode==='daily'?seedFromDate(localDate,nextLanguage):Date.now();
   reset(promptForMode({mode:nextMode,locale:nextLanguage,layoutId:nextLayout,seed,count:nextCount,durationSeconds:nextDuration,track:nextTrack,customText:content}));
  }catch(e){setSaveNotice(e instanceof Error?e.message:'Не удалось создать упражнение.');}
 };
 useEffect(()=>{
  if(!lessonId)return;
  const nextLang:SupportedLocale=query.get('lang')==='en'?'en':'ru';
  const nextLayout=nextLang==='ru'?'ru-jcuken':'en-qwerty';
  void prepare('lesson',nextLang,nextLayout,track,count,duration,customText,lessonId);
  // Trigger only when academy link changes: other controls reset through prepare directly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[lessonId,query.get('lang'),lessonVariant]);
 const stop=(at:number)=>{const s=finishEngine(sessionRef.current,at);sessionRef.current=s;setSession(s);};
 const commit=(value:string,source:InputSource='keyboard',nativeTimestampMs?:number)=>{
  const receivedAt=performance.now();
  const fromEvent=nativeTimestampMs===undefined?receivedAt:normalizedEventTimestamp(nativeTimestampMs,receivedAt,performance.timeOrigin);
  const previous=sessionRef.current.attempts.at(-1)?.atMs??0;
  const at=Math.max(fromEvent,previous); // preserve monotonic order under delayed dispatch
  let next=acceptInput(sessionRef.current,value,at,source);
  if(mode==='hardcore'&&!settings.gentleMode&&next.attempts.length>sessionRef.current.attempts.length&&next.attempts.slice(sessionRef.current.attempts.length).some(a=>!a.correct))next=finishEngine(next,at);
  sessionRef.current=next;setSession(next);
 };
 const onInput=(event:FormEvent<HTMLTextAreaElement>)=>{
  if(composing.current||(event.nativeEvent as InputEvent).isComposing){setCompositionDraft(event.currentTarget.value);return;}
  commit(event.currentTarget.value,'keyboard',event.nativeEvent.timeStamp);
 };
 const onCompositionEnd=(event:CompositionEvent<HTMLTextAreaElement>)=>{
  composing.current=false;commit(event.currentTarget.value,'composition',event.nativeEvent.timeStamp);setCompositionDraft('');
 };
 const onPaste=(event:ClipboardEvent<HTMLTextAreaElement>)=>{event.preventDefault();setSaveNotice('Вставка в тест отключена. В режиме «Свой текст» вставлять можно в поле подготовки.');};
 const onDrop=(event:DragEvent<HTMLTextAreaElement>)=>event.preventDefault();
 const beforeInput=(event:FormEvent<HTMLTextAreaElement>)=>{
  const native=event.nativeEvent as InputEvent;
  if(native.inputType==='insertFromPaste'||native.inputType==='insertFromDrop')event.preventDefault();
 };
 useEffect(()=>{
  if(session.startedAtMs===null||session.endedAtMs!==null)return;
  const id=window.setInterval(()=>{
   const at=performance.now();setNow(at);
   if(mode==='time'&&at-sessionRef.current.startedAtMs!>=duration*1000)stop(at);
  },250);
  return()=>window.clearInterval(id);
 },[session.startedAtMs,session.endedAtMs,mode,duration]);
 useEffect(()=>{
  function onEscape(e:KeyboardEvent){if(e.key==='Escape')setFocus(false);}
  window.addEventListener('keydown',onEscape);return()=>window.removeEventListener('keydown',onEscape);
 },[]);
 useEffect(()=>{document.body.classList.toggle('focus-mode',focus);return()=>document.body.classList.remove('focus-mode');},[focus]);
 useEffect(()=>{
  if(session.endedAtMs===null)return;
  const id=`${session.prompt.id}-${session.startedAtMs}`;
  if(savedId.current===id)return;savedId.current=id;
  setPersistence('saving');
  // Completed alignments can be quadratic. Never run them synchronously in render.
  void scoreAsync(session,session.endedAtMs).then(async summary=>{
   const record={id:crypto.randomUUID(),endedAt:new Date().toISOString(),mode:session.prompt.mode,
    locale:session.prompt.locale,layoutId:session.prompt.layoutId,promptId:session.prompt.id,summary,schemaVersion:1 as const};
   if(savedId.current===id)setFinalScore(summary);
   await repositories.progress.saveSession(record);
   if(savedId.current===id){setSaveNotice('Результат сохранён только на этом устройстве.');setPersistence('saved');}
   try{await repositories.skills.incorporate(session);}catch{
    if(savedId.current===id)setSaveNotice('Результат сохранён, но модель навыка не обновилась.');
   }
  }).catch(()=>{if(savedId.current===id){setPersistence('failed');setSaveNotice('Не удалось рассчитать или сохранить результат.');}});
 },[session]);
 const interimScore=useMemo(()=>calculateScoreV2(session.endedAtMs===null?session:{...session,endedAtMs:null},now||session.endedAtMs||session.startedAtMs||0),[session,now]);
 const score=finalScore??interimScore;
 const targetChars=useMemo(()=>graphemes(prompt.text),[prompt.text]);
 const pos=currentPosition(session),finished=session.endedAtMs!==null;
 const timer=elapsedMs(session,now||session.endedAtMs||0);
 const remaining=Math.max(0,duration-timer/1000);
 const showElapsed=mode==='time'?`${Math.ceil(remaining)} с`:`${(timer/1000).toFixed(1)} с`;
 const canEnd=session.startedAtMs!==null&&!finished;
 const blurText=mode==='blind'&&session.startedAtMs!==null;
 const shouldConfigure=mode==='custom';
 const passages=getPassages(language,track);
 const loadTextFile=async(file:File|undefined)=>{
  if(!file)return;
  if(file.size>100_000){setSaveNotice('Файл слишком большой (максимум 100 КБ).');return;}
  if(!(/\.(txt|md)$/i.test(file.name)||file.type.startsWith('text/'))){setSaveNotice('Поддерживаются только текстовые файлы TXT и MD.');return;}
  const text=await file.text();setCustomText(text);
  await prepare('custom',language,layoutId,track,count,duration,text);
 };
 return <section className="practice-page">
 {!focus&&<PageHeader kicker="TYKORA / Practice" title={copy.practiceTitle}>{copy.practiceIntro}</PageHeader>}
 {focus&&<button type="button" className="btn secondary focus-exit" onClick={()=>{setFocus(false);requestAnimationFrame(()=>inputRef.current?.focus());}}>{t('exitFocus')} (Esc)</button>}
 {!focus&&<div className="practice-toolbar" role="group" aria-label="Настройки тренировки">
  <label className="sr-only" htmlFor="practice-language">Язык текста</label>
  <select id="practice-language" className="chip" value={language} onChange={e=>{
   const lang=e.target.value as SupportedLocale;void prepare(mode,lang,layouts[lang][0].id,track,count,duration,customText);
  }}><option value="ru">Русский</option><option value="en">English</option></select>
  <label className="sr-only" htmlFor="practice-layout">Раскладка</label>
  <select id="practice-layout" className="chip" value={layoutId} onChange={e=>void prepare(mode,language,e.target.value,track,count,duration,customText)}>{layouts[language].map(l=><option key={l.id} value={l.id}>{l.label}</option>)}</select>
  <label className="sr-only" htmlFor="practice-mode">Режим</label>
  <select id="practice-mode" className="chip" value={mode} onChange={e=>void prepare(e.target.value as Selection)}>
   {mode==='lesson'&&<option value="lesson">Урок курса</option>}{(Object.keys(modeLabels) as ModeId[]).map(m=><option value={m} key={m}>{modeLabels[m]}</option>)}
  </select>
  <div className="spacer"/><button type="button" className="btn small-btn" onClick={()=>reset()}>↺ {t('restart')}</button>
  <button type="button" className="btn secondary small-btn" aria-pressed={focus} onClick={()=>{setFocus(x=>!x);requestAnimationFrame(()=>inputRef.current?.focus());}}>{focus?t('exitFocus'):`⛶ ${t('focus')}`}</button>
 </div>}
 {!focus&&<div className="mode-options">
  {(mode==='words'||mode==='adaptive')&&<label className="small">Слов <select className="chip" value={count} onChange={e=>void prepare(mode,language,layoutId,track,Number(e.target.value))}><option>10</option><option>25</option><option>50</option>{mode==='words'&&<option>100</option>}</select></label>}
  {mode==='time'&&<label className="small">Время <select className="chip" value={duration} onChange={e=>void prepare(mode,language,layoutId,track,count,Number(e.target.value))}>{[15,30,60,120].map(n=><option value={n} key={n}>{n} секунд</option>)}</select></label>}
  {mode==='quote'&&<label className="small">Тематика <select className="chip" value={track} onChange={e=>void prepare(mode,language,layoutId,e.target.value as TrackId)}>{tracks.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></label>}
  {mode==='daily'&&<span className="chip">Единый текст дня для выбранного языка · без глобального рейтинга</span>}
  {mode==='hardcore'&&<span className="chip">Первая ошибка завершает попытку</span>}
  {mode==='blind'&&<span className="chip">Текст скрывается после первого символа</span>}
  {mode==='burst'&&<span className="chip">12 слов · скоростной подход</span>}
  {(mode==='zen'||mode==='marathon')&&<span className="chip">Ручное завершение доступно после начала набора</span>}
  {mode==='lesson'&&<span className="chip accent">{lessonTitle||lessonId}</span>}
  {shouldConfigure&&<div className="custom-editor surface"><label htmlFor="custom-text"><b>Ваш текст для тренировки</b></label><p className="small muted">До 6 000 символов. Текст обрабатывается локально и не сохраняется в истории.</p>
    <textarea id="custom-text" rows={4} value={customText} onChange={e=>setCustomText(e.target.value)} placeholder="Вставьте собственный текст здесь"/>
    <div className="row" style={{gap:12,flexWrap:'wrap'}}><button className="btn primary small-btn" type="button" onClick={()=>void prepare('custom',language,layoutId,track,count,duration,customText)}>Загрузить текст в упражнение</button><label className="btn secondary small-btn file-label">Открыть TXT/MD <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={e=>void loadTextFile(e.target.files?.[0])}/></label></div>
   </div>}
  {mode==='quote'&&<span className="small muted">{passages.length} оригинальных текстов в выбранном треке · автор TYKORA</span>}
 </div>}
 <div className="surface practice-stage">
  <div className="practice-stats"><div className="practice-numbers">
   <div><div className="label">{mode==='time'?'ОСТАЛОСЬ':'ВРЕМЯ'}</div><strong>{mode==='zen'&&!finished?'—':showElapsed}</strong></div>
   <div><div className="label">NET WPM</div><strong>{session.startedAtMs===null||(mode==='zen'&&!finished)?'—':displayWpm(score.netWpm)}</strong></div>
   <div><div className="label">ТОЧНОСТЬ</div><strong>{score.totalAttempts&&(mode!=='zen'||finished)?`${(score.accuracy*100).toFixed(1)}%`:'—'}</strong></div>
  </div><span className="chip accent">{finished?t('sessionDone'):session.startedAtMs===null?t('sessionReady'):t('sessionRunning')}</span></div>
  <div className="typearea" onClick={()=>!finished&&inputRef.current?.focus()}>
   <TargetDisplay target={prompt.text} typed={session.typed} position={pos} finished={finished} blur={blurText}/>
  </div>
  <p className="sr-only" id="target-readable">{t('target')}: {targetChars.slice(pos,pos+110).join('')}</p>
  <label className="sr-only" htmlFor="typing-input">{t('input')}</label>
  <textarea ref={inputRef} id="typing-input" className="typeinput" value={composing.current?compositionDraft:session.typed}
   onInput={onInput} onBeforeInput={beforeInput} onPaste={onPaste} onDrop={onDrop}
   onCompositionStart={()=>{composing.current=true;setCompositionDraft(sessionRef.current.typed);}} onCompositionEnd={onCompositionEnd}
   onKeyDown={event=>setLastCode(event.code)} disabled={finished} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
   aria-describedby="typing-help target-readable" aria-keyshortcuts="Tab" rows={2} placeholder={t('exerciseHelp')}/>
  <div className="inline-help" id="typing-help"><span>Обработка локальная · Вставка отключена · {mode==='hardcore'?'Первая ошибка завершает попытку':'Ошибки можно исправлять'}</span><span>Esc — выход из фокуса</span></div>
  {canEnd&&mode!=='time'&&<button type="button" className="btn secondary small-btn end-session" onClick={()=>stop(performance.now())}>{t('finish')}</button>}
  {finished&&<div className="finished-box" role="status"><div><strong>Завершено · {displayWpm(score.netWpm)} WPM</strong><p className="small">Точность {(score.accuracy*100).toFixed(1)}% · Неисправленных ошибок {score.uncorrectedErrors}</p></div><button className="btn primary" type="button" disabled={persistence!=='saved'} onClick={()=>navigate('/result')}>{persistence==='saving'?'Сохранение…':'Полный результат ↗'}</button></div>}
  {saveNotice&&<p className="small muted" role="status" style={{marginTop:16}}>{saveNotice}</p>}
 </div>
 {!focus&&<div className="surface keyboard-card"><div className="row spread"><h2 style={{fontSize:17,letterSpacing:'-.025em',fontWeight:700}}>Визуальная клавиатура</h2><label className="small row"><input checked={settings.showKeyboard} onChange={e=>void updateSettings({showKeyboard:e.target.checked})} type="checkbox"/> Показать</label></div>
  {settings.showKeyboard&&<KeyboardPreview next={targetChars[pos]??' '} locale={language} layoutId={layoutId} code={lastCode}/>}
 </div>}
 {!focus&&<div className="note" style={{marginTop:14}}>В курс входят {curriculum.length} упражнения RU/EN. Другие раскладки доступны как физические подсказки, но переведённые курсы для них пока не созданы. Результат не подтверждает, каким пальцем была нажата клавиша. Источники учебных и профессиональных текстов — собственный контент TYKORA.</div>}
 </section>;
}
