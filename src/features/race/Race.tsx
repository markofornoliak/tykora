import {useEffect,useMemo,useRef,useState,type FormEvent,type CompositionEvent,type ClipboardEvent} from 'react';
import {useSearchParams} from 'react-router-dom';
import {PageHeader} from '../../shared/ui/Layout';
import {createEngine,acceptInput,type EngineState} from '../../domain/typing/engine';
import {graphemes} from '../../domain/typing/graphemes';
import {calculateScore} from '../../domain/metrics/metrics';
import {makeBots,botProgress,raceProgress,raceText,sanitizeRoomId,type BotDifficulty} from '../../domain/social/race';
import {ManualPeer} from '../../infrastructure/peer/manualWebRtc';
import {repositories} from '../../infrastructure/di/repositories';
import {useBilingual} from '../../shared/i18n/useBilingual';

export function Race(){
 const tr=useBilingual();
 const [query]=useSearchParams();
 const initialRoom=sanitizeRoomId(query.get('room')??'practice');
 const [room,setRoom]=useState(initialRoom||'practice');
 const [locale,setLocale]=useState<'ru'|'en'>(query.get('lang')==='en'?'en':'ru');
 const [difficulty,setDifficulty]=useState<BotDifficulty>('intermediate');
 const [role,setRole]=useState<'host'|'guest'>(query.has('room')?'guest':'host');
 const [manualInput,setManualInput]=useState('');const [manualOutput,setManualOutput]=useState('');
 const [stun,setStun]=useState(false);
 const [connection,setConnection]=useState('не подключено');
 const [peerProgress,setPeerProgress]=useState(0),[peerFinished,setPeerFinished]=useState(false);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const peerRef=useRef<ManualPeer|null>(null);
 const promptText=useMemo(()=>raceText(room,locale),[room,locale]);
 const prompt=useMemo(()=>({id:`race-${room}-${locale}`,text:promptText,mode:'words' as const,locale,layoutId:locale==='ru'?'ru-jcuken':'en-qwerty',license:'original' as const,sourceAttribution:'TYKORA original'}),[promptText,room,locale]);
 const [session,setSession]=useState<EngineState>(()=>createEngine(prompt));
 const stateRef=useRef(session);const [now,setNow]=useState(0);
 const savedRef=useRef('');const [composition,setComposition]=useState('');const composingRef=useRef(false);
 const bots=useMemo(()=>makeBots(`${room}:${locale}`,difficulty),[room,locale,difficulty]);
 const [peerMode,setPeerMode]=useState(false);
 const [sharedStart,setSharedStart]=useState<number|null>(null);
 const [wallNow,setWallNow]=useState(Date.now());
 const inputRef=useRef<HTMLTextAreaElement>(null);
 const reset=()=>{const fresh=createEngine(prompt);stateRef.current=fresh;setSession(fresh);savedRef.current='';setNow(0);setMessage('');setPeerProgress(0);setPeerFinished(false);setSharedStart(null);};
 useEffect(()=>{reset();/* switching race course invalidates the existing run */},[prompt]);
 useEffect(()=>()=>{peerRef.current?.close();},[]);
 useEffect(()=>{if((session.startedAtMs===null&&sharedStart===null)||session.endedAtMs!==null)return;const id=window.setInterval(()=>{setNow(performance.now());setWallNow(Date.now());},100);return()=>window.clearInterval(id);},[session.startedAtMs,session.endedAtMs,sharedStart]);
 useEffect(()=>{if(session.endedAtMs===null)return;
  const key=`${prompt.id}:${session.startedAtMs}`;if(savedRef.current===key)return;savedRef.current=key;
  if(session.startedAtMs===null)return;
  // Store local scores only. These are *unverified* races, not rankings.
  const record={id:crypto.randomUUID(),endedAt:new Date().toISOString(),mode:prompt.mode,locale,layoutId:prompt.layoutId,promptId:prompt.id,summary:calculateScore(session,session.endedAtMs),schemaVersion:1 as const};
  void repositories.progress.saveSession(record).then(()=>setMessage(tr('Гонка завершена. Результат сохранён локально.','Race finished. Result saved locally.'))).catch(()=>setMessage(tr('Результат не удалось сохранить.','Could not save the result.')));
 },[session,prompt,locale]);
 const commit=(text:string)=>{
  if(peerMode&&(connection!=='connected'||sharedStart===null||Date.now()<sharedStart))return;
  const state=acceptInput(stateRef.current,text,performance.now());stateRef.current=state;setSession(state);
  peerRef.current?.send(raceProgress(state.typed,promptText),state.endedAtMs!==null);
 };
 const onCompositionEnd=(e:CompositionEvent<HTMLTextAreaElement>)=>{composingRef.current=false;commit(e.currentTarget.value);setComposition('');};
 const onInput=(e:FormEvent<HTMLTextAreaElement>)=>{if(composingRef.current||(e.nativeEvent as InputEvent).isComposing){setComposition(e.currentTarget.value);return;}commit(e.currentTarget.value);};
 const elapsed=peerMode&&sharedStart!==null?Math.max(0,wallNow-sharedStart):Math.max(0,((session.endedAtMs??now)-(session.startedAtMs??now)));
 const myProgress=raceProgress(session.typed,promptText),finished=session.endedAtMs!==null;
 const targetChars=useMemo(()=>graphemes(promptText),[promptText]);
 const typedChars=useMemo(()=>graphemes(session.typed),[session.typed]);
 const score=calculateScore(session,session.endedAtMs??now);
 const botNamesEn:Record<string,string>={'bot-0':'Quiet Wind','bot-1':'Steady Rhythm','bot-2':'Fast Typist'};
 const speedEntries=peerMode&&connection==='connected'?[{id:'peer',name:tr('Другой участник','Other participant'),progress:peerProgress,bot:false}]:bots.map(b=>({id:b.id,name:tr(b.name,botNamesEn[b.id]??b.name),progress:botProgress(b,elapsed,promptText),bot:true}));
 const link=`${location.origin}${location.pathname}#/race?room=${encodeURIComponent(room)}&lang=${locale}`;
 const connect=async(action:'offer'|'answer'|'apply')=>{
  setBusy(true);setMessage('');
  try{
   if(action==='apply'){
    if(!peerRef.current)throw new Error(tr('Сначала создайте приглашение.','Create an invitation first.'));
    await peerRef.current.applyAnswer(manualInput.trim());setMessage(tr('Ответ принят. Ожидайте соединения WebRTC.','Answer accepted. Waiting for WebRTC connection.'));
   }else{
    peerRef.current?.close();const peer=new ManualPeer(`${room}:${locale}`,stun,setConnection,p=>{setPeerProgress(p.fraction);setPeerFinished(p.finished);},s=>{setSharedStart(s.epochMs);setMessage(tr('Общий старт получен. Готовьтесь к набору.','Shared starting time received. Get ready to type.'));});peerRef.current=peer;
    setPeerMode(true);setConnection('connecting');
    const out=action==='offer'?await peer.offer():await peer.answer(manualInput.trim());
    setManualOutput(out);setMessage(action==='offer'?tr('Отправьте созданный код гостю.','Send this code to your guest.'):tr('Отправьте ответный код создателю комнаты.','Send the answer code to the host.'));
   }
  }catch(err){setMessage(err instanceof Error?err.message:tr('Ошибка соединения.','Connection error.'));}
  finally{setBusy(false);}
 };
 const beginShared=()=>{
  try{if(!peerRef.current?.connected)throw new Error(tr('Сначала дождитесь подключения.','Wait for the peer connection first.'));
   reset();const start=Date.now()+5000;setSharedStart(start);peerRef.current.start(start);setMessage(tr('Общий старт через 5 секунд. Время синхронизируется приблизительно по часам устройств.','Shared race starts in 5 seconds. Device clocks are approximately synchronized.'));
  }catch(e){setMessage(e instanceof Error?e.message:tr('Не удалось начать гонку.','Could not start the race.'));}
 };
 const disconnect=()=>{peerRef.current?.close();peerRef.current=null;setPeerMode(false);setConnection('не подключено');setManualInput('');setManualOutput('');reset();};
 return <section className="social-page">
  <PageHeader kicker="Social / Race Lab" title={tr('Соревнуйтесь в своём ритме.','Race at your own pace.')}>{tr('Три локальных бота доступны офлайн. Для гонки с другом используйте экспериментальную P2P-комнату с ручным обменом кодами подключения.','Three simulated bots work offline. To race a friend, use an experimental peer-to-peer room with manual connection code exchange.')}</PageHeader>
  <div className="surface card race-setup">
   <div className="row spread"><h2>{tr('Гоночная дорожка','Race track')}</h2><span className="chip accent">{peerMode?'P2P · Beta':'OFFLINE BOTS'}</span></div>
   <div className="mode-options">
    <label>{tr('Комната','Room')} <input aria-label={tr('Код комнаты','Room code')} className="social-input short" maxLength={28} value={room} disabled={session.startedAtMs!==null||peerMode} onChange={e=>setRoom(sanitizeRoomId(e.target.value)||'practice')}/></label>
    <label>{tr('Текст','Text')} <select className="chip" value={locale} disabled={session.startedAtMs!==null||peerMode} onChange={e=>setLocale(e.target.value as 'ru'|'en')}><option value="ru">{tr('Русский','Russian')}</option><option value="en">English</option></select></label>
    <label>{tr('Боты','Bots')} <select className="chip" value={difficulty} disabled={session.startedAtMs!==null} onChange={e=>setDifficulty(e.target.value as BotDifficulty)}><option value="beginner">{tr('Начинающие','Beginner')}</option><option value="intermediate">{tr('Средние','Intermediate')}</option><option value="advanced">{tr('Быстрые','Advanced')}</option></select></label>
    <button className="btn secondary small-btn" onClick={reset} type="button">{tr('Заново','Restart')}</button>
   </div>
   {peerMode&&<div className="note" role="status">{sharedStart===null?tr('Ожидание общего старта от создателя комнаты.','Waiting for the host to start.'):wallNow<sharedStart?tr(`Старт через ${Math.max(1,Math.ceil((sharedStart-wallNow)/1000))} с`,`Starts in ${Math.max(1,Math.ceil((sharedStart-wallNow)/1000))} s`):tr('Общий старт!','Shared start!')} · {tr('Соединение: ','Connection: ')}{connection}</div>}
   <div className="race-tracks" aria-label={tr('Прогресс участников','Participant progress')}><div className="race-lane"><div className="row spread"><strong>{tr('Вы','You')}</strong><span>{Math.round(myProgress*100)}%</span></div><div className="race-bar"><i style={{width:`${myProgress*100}%`}}/></div></div>
    {speedEntries.map(entry=><div className="race-lane" key={entry.id}><div className="row spread"><span>{entry.name}{entry.bot?tr(' · бот',' · bot'):''}{entry.id==='peer'&&peerFinished?tr(' · финиш',' · finished'):''}</span><span>{Math.round(entry.progress*100)}%</span></div><div className="race-bar"><i style={{width:`${entry.progress*100}%`}}/></div></div>)}
   </div>
   <div className="social-race-text" aria-hidden="true">{targetChars.map((char,index)=><span key={index} className={index<typedChars.length?(typedChars[index]===char?'typed':'err'):index===typedChars.length?'caret':''}>{char}</span>)}</div>
   <label className="sr-only" htmlFor="race-input">{tr('Наберите предложенный текст','Type the displayed text')}</label>
   <p className="sr-only" id="race-target">{tr('Текст для набора: ','Typing target: ')}{promptText}</p>
   <textarea ref={inputRef} id="race-input" aria-describedby="race-target" className="social-textarea" value={composingRef.current?composition:session.typed} disabled={finished||(peerMode&&(connection!=='connected'||sharedStart===null||wallNow<sharedStart))} placeholder={tr('Нажмите сюда и начните печатать…','Click here and start typing…')} onInput={onInput}
     onBeforeInput={e=>{const t=(e.nativeEvent as InputEvent).inputType;if(t==='insertFromPaste'||t==='insertFromDrop')e.preventDefault();}}
     onPaste={(e:ClipboardEvent<HTMLTextAreaElement>)=>e.preventDefault()} onDrop={e=>e.preventDefault()}
     onCompositionStart={()=>{composingRef.current=true;setComposition(stateRef.current.typed);}} onCompositionEnd={onCompositionEnd} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} rows={2}/>
   <div className="row spread" style={{marginTop:14,gap:12,flexWrap:'wrap'}}><span className="small muted">{finished?tr('Финиш!','Finished!'):session.startedAtMs===null?tr('Старт по первому символу','Start on the first character'):tr('Гонка идёт…','Race in progress…')} · {Math.round(elapsed/1000)} c</span><strong>{score.netWpm.toFixed(1)} WPM · {(score.accuracy*100).toFixed(1)}%</strong></div>
  </div>
  <div className="surface card" style={{marginTop:18}}><div className="row spread"><h2>{tr('Гонка с другом','Race with a friend')}</h2><span className="chip">{tr('WebRTC · экспериментально','WebRTC · experimental')}</span></div>
   <p className="small muted">{tr('Ссылка задаёт одинаковый текст, но ','The link sets the same text but ')}<strong>{tr('не подключает участников автоматически','does not connect participants automatically')}</strong>{tr('. Нужен обмен SDP-кодами; без STUN доступна в основном локальная сеть. Нет TURN, поэтому некоторые подключения не работают. Другой участник может узнать ваш IP через WebRTC.','. Exchange SDP codes manually; without STUN mostly local networks work. There is no TURN, so some connections fail. WebRTC may reveal your IP address to the other participant.')}</p>
   <div className="social-form"><label htmlFor="race-link">{tr('Ссылка-приглашение','Invitation link')}</label><div className="row" style={{gap:8}}><input id="race-link" value={link} readOnly/><button className="btn secondary" type="button" onClick={()=>void navigator.clipboard.writeText(link).then(()=>setMessage(tr('Ссылка скопирована.','Link copied.'))).catch(()=>setMessage(tr('Не удалось скопировать ссылку.','Could not copy link.')))}>{tr('Копировать','Copy')}</button></div>
    <label htmlFor="race-role">{tr('Моя роль','My role')}</label><select id="race-role" value={role} disabled={busy||peerMode} onChange={e=>setRole(e.target.value as 'host'|'guest')}><option value="host">{tr('Создатель комнаты','Host')}</option><option value="guest">{tr('Гость','Guest')}</option></select>
    <label className="small"><input type="checkbox" checked={stun} disabled={busy||peerMode} onChange={e=>setStun(e.target.checked)}/> {tr('Разрешить внешний STUN (Google; сервис увидит ваш IP-адрес)','Allow external STUN (Google; this service will see your IP address)')}</label>
    {role==='guest'&&<label>{tr('Код приглашения от создателя','Invitation code from host')}<textarea rows={3} value={manualInput} onChange={e=>setManualInput(e.target.value)} placeholder={tr('Вставьте предложение SDP в формате JSON','Paste the SDP offer in JSON format')}/></label>}
    {role==='host'&&!manualOutput&&<button className="btn primary" type="button" disabled={busy} onClick={()=>void connect('offer')}>{busy?tr('Создание…','Creating…'):tr('1. Создать приглашение','1. Create invitation')}</button>}
    {role==='guest'&&<button className="btn primary" type="button" disabled={busy||!manualInput.trim()} onClick={()=>void connect('answer')}>{busy?tr('Подключение…','Connecting…'):tr('2. Создать ответ','2. Create answer')}</button>}
    {manualOutput&&<><label>{tr('Ваш код для второго участника','Your code for the other participant')}<textarea rows={4} value={manualOutput} readOnly onFocus={e=>e.currentTarget.select()}/></label><button className="btn secondary" type="button" onClick={()=>void navigator.clipboard.writeText(manualOutput).then(()=>setMessage(tr('Код скопирован.','Code copied.'))).catch(()=>setMessage(tr('Не удалось скопировать код.','Could not copy the code.')))}>{tr('Копировать код','Copy code')}</button></>}
    {role==='host'&&manualOutput&&connection!=='connected'&&<><label>{tr('Ответ гостя','Guest answer')}<textarea rows={3} value={manualInput} onChange={e=>setManualInput(e.target.value)}/></label><button className="btn primary" disabled={busy||!manualInput.trim()} type="button" onClick={()=>void connect('apply')}>{tr('3. Принять ответ','3. Accept answer')}</button></>}
    {peerMode&&role==='host'&&connection==='connected'&&<button className="btn primary" type="button" onClick={beginShared}>{tr('Начать общую гонку (5 с)','Start shared race (5 s)')}</button>}
    {peerMode&&<button className="btn secondary" type="button" onClick={disconnect}>{tr('Отключиться от P2P','Disconnect P2P')}</button>}
    <div role="status" className="small muted">{tr('Соединение: ','Connection: ')}{connection}. {message}</div>
   </div>
  </div>
  <div className="note" style={{marginTop:16}}>{tr('Локальные боты симулируются математически и не представляют реальных игроков. P2P-результаты не защищены от подмены. Гонки не используются для глобального рейтинга.','Local bots are mathematical simulations, not real players. P2P results can be tampered with. Races do not contribute to a global leaderboard.')}</div>
 </section>;
}
