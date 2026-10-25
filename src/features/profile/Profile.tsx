import {useEffect,useState,type FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {PageHeader} from '../../shared/ui/Layout';
import {repositories} from '../../infrastructure/di/repositories';
import {summarizeProgress} from '../../domain/social/progression';
import type {SessionRecord} from '../../application/ports/ProgressRepository';
import {downloadText} from '../../shared/utils/download';
import {exportLocalBackup,importLocalBackup,parseBackupFile} from '../../infrastructure/backup/backup';
import {useUiStore} from '../../app/store/uiStore';

export function Profile(){
 const [alias,setAlias]=useState('');
 const [sessions,setSessions]=useState<SessionRecord[]>([]);
 const [profileNotice,setProfileNotice]=useState('');
 const [backupNotice,setBackupNotice]=useState('');
 const [backupBusy,setBackupBusy]=useState(false);
 const [profileReady,setProfileReady]=useState(false);
 const [savingAlias,setSavingAlias]=useState(false);
 const [importMode,setImportMode]=useState<'merge'|'replace'>('merge');
 useEffect(()=>{let live=true;
  void Promise.all([repositories.profile.get(),repositories.progress.getRecentSessions(10000)])
   .then(([p,s])=>{if(live){setAlias(p?.alias??'');setSessions(s);setProfileReady(true);}})
   .catch(()=>{if(live){setProfileNotice('Не удалось открыть локальные данные.');setProfileReady(true);}});
  return ()=>{live=false;};
 },[]);
 const stats=summarizeProgress(sessions);
 const save=async(event:FormEvent)=>{
  event.preventDefault();
  if(!profileReady||savingAlias)return;
  setSavingAlias(true);setProfileNotice('');
  try{
   const saved=await repositories.profile.save(alias);
   setAlias(saved.alias);
   setProfileNotice('Псевдоним сохранён только на устройстве.');
  }catch(e){setProfileNotice(e instanceof Error?e.message:'Не удалось сохранить.');}
  finally{setSavingAlias(false);}
 };
 const exportBackup=async()=>{
  setBackupBusy(true);setBackupNotice('');
  try{
   const data=await exportLocalBackup();
   downloadText(`tykora-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(data,null,2));
   setBackupNotice('Резервная копия сохранена в файл. Храните её в защищённом месте.');
  }catch{setBackupNotice('Не удалось создать резервную копию: проверьте разрешения хранилища.');}
  finally{setBackupBusy(false);}
 };
 const restoreBackup=async(file:File|undefined)=>{
  if(!file)return;
  setBackupBusy(true);setBackupNotice('');
  try{
   // Validate the incoming file before offering any destructive operation.
   const parsed=await parseBackupFile(file);
   if(importMode==='replace'){
    const snapshot=await exportLocalBackup();
    const backupName=`tykora-before-replace-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    downloadText(backupName,JSON.stringify(snapshot,null,2));
    // The browser cannot prove that a download was saved; require explicit confirmation.
    if(!window.confirm(`Перед заменой начато скачивание резервной копии "${backupName}". Проверьте, что файл сохранён и доступен. ЗАМЕНИТЬ все локальные занятия, навыки и настройки?`)){
     setBackupNotice('Замена отменена. Исходные данные не изменены.');
     return;
    }
   }
   const counts=await importLocalBackup(parsed,importMode);
   await useUiStore.getState().initialize(true);
   const [p,all]=await Promise.all([repositories.profile.get(),repositories.progress.getRecentSessions(10000)]);
   setAlias(p?.alias??'');setSessions(all);
   setBackupNotice(`Импортировано ${counts.sessions} занятий и ${counts.skills} записей навыков. Данные остаются на устройстве.`);
  }catch(error){setBackupNotice(error instanceof Error?`Импорт не выполнен: ${error.message}`:'Импорт не выполнен.');}
  finally{setBackupBusy(false);}
 };
 const earned=stats.achievements.filter(a=>a.unlocked).length;
 const exportBadge=()=>{
  const safe=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="640" viewBox="0 0 1080 640"><rect width="1080" height="640" fill="#16271f"/><text x="70" y="90" font-family="sans-serif" font-size="32" fill="#b2d8c6">▦ TYKORA</text><text x="70" y="200" font-family="sans-serif" font-size="28" fill="#a6bfb0">Локальная карточка достижений</text><text x="70" y="325" font-family="sans-serif" font-size="105" font-weight="bold" fill="#ffffff">${stats.bestWpm.toFixed(0)} WPM</text><text x="70" y="405" font-family="sans-serif" font-size="35" fill="#ffffff">${safe(alias||'Гость')} · ${safe(stats.tier)}</text><text x="70" y="493" font-family="sans-serif" font-size="30" fill="#b2d8c6">${earned} / ${stats.achievements.length} достижений</text><text x="70" y="580" font-family="sans-serif" font-size="23" fill="#c6cfc8">Самостоятельная карточка · Не является проверенным сертификатом</text></svg>`;
  downloadText('tykora-achievements.svg',svg,'image/svg+xml;charset=utf-8');
 };
 return <section className="social-page">
  <PageHeader kicker="Личное пространство / Local Profile" title="Прогресс принадлежит вам.">Без аккаунта, подписки и публичного рейтинга. Достижения строятся исключительно из ваших занятий на этом устройстве.</PageHeader>
  <div className="social-grid">
   <div className="surface card"><div className="eyebrow">Локальный профиль</div><h2>{alias||'Гость TYKORA'}</h2>
    <p className="small muted">Псевдоним не отправляется на сервер. Не используйте настоящее имя, если хотите сохранить анонимность.</p>
    <form onSubmit={save} className="social-form"><label htmlFor="profile-alias">Псевдоним</label><input id="profile-alias" disabled={!profileReady||savingAlias} maxLength={32} placeholder="Например, SilentFox" value={alias} onChange={e=>setAlias(e.target.value)}/><button type="submit" disabled={!profileReady||savingAlias} className="btn primary">Сохранить имя</button></form>
    {profileNotice&&<p role="status" className="small muted">{profileNotice}</p>}
   </div>
   <div className="surface card"><div className="eyebrow">Персональный уровень</div><h2>{stats.tier}</h2><p className="small muted">Определяется лучшей сохранённой скоростью. Это не мировая лига и не официальный рейтинг.</p>
   <div className="social-stat-grid"><div><strong>{stats.bestWpm.toFixed(1)}</strong><span>Рекорд WPM</span></div><div><strong>{stats.total}</strong><span>Тестов</span></div><div><strong>{stats.minutes.toFixed(0)}</strong><span>Минут</span></div><div><strong>{stats.currentStreak}</strong><span>Дней подряд</span></div></div>
   <p className="small muted">Пропуск не наказывается: серия просто считается от последнего активного дня.</p></div>
  </div>
  <div className="row spread section-title"><h2>Коллекция достижений</h2><span className="hint">{earned} / {stats.achievements.length}</span></div>
  <div className="achievement-grid">{stats.achievements.map(a=><div key={a.id} className={`surface achievement ${a.unlocked?'unlocked':''}`}>
   <span className="achievement-icon" aria-hidden="true">{a.unlocked?'✦':'○'}</span><div><strong>{a.title}</strong><p className="small muted">{a.detail}</p><div className="progress" aria-hidden="true"><i style={{width:`${Math.min(100,a.value/a.threshold*100)}%`}}/></div><span className="small muted">{Number(a.value.toFixed(1))} / {a.threshold}</span></div></div>)}</div>
  <div className="surface card" style={{marginTop:20}}>
   <h3>Мои данные · резервная копия</h3>
   <p className="small muted">Экспортируйте историю занятий, карту навыков, настройки, тренировочный план и псевдоним в JSON. Файл создаётся и читается локально; сеть не используется. Не публикуйте его — он содержит вашу историю.</p>
   <div className="row" style={{gap:10,flexWrap:'wrap',marginTop:16}}><button type="button" disabled={backupBusy} className="btn primary" onClick={()=>void exportBackup()}>Скачать резервную копию</button>
    <label className="row small" htmlFor="backup-mode">Режим импорта
     <select id="backup-mode" value={importMode} disabled={backupBusy} onChange={e=>setImportMode(e.target.value as 'merge'|'replace')}>
      <option value="merge">Объединить записи</option><option value="replace">Полностью заменить</option>
     </select>
    </label>
    <label className="btn secondary" htmlFor="backup-file">Восстановить из JSON</label>
    <input id="backup-file" type="file" accept="application/json,.json" disabled={backupBusy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';void restoreBackup(file);}} />
   </div>
   <p className="small muted">В режиме «Объединить» записи с одинаковым ID из файла обновляют соответствующие локальные записи. При «Полностью заменить» появится отдельное подтверждение. Поддерживается формат резервной копии TYKORA v1, до 25 МБ.</p>
   {backupNotice&&<p role="status" className="small muted">{backupNotice}</p>}
  </div>
  <div className="surface card" style={{marginTop:20}}><h3>Поделиться успехом</h3><p className="small muted">SVG-карточка создаётся локально. Она не является сертификатом и не подтверждает независимую проверку скорости.</p><div className="row" style={{gap:10,flexWrap:'wrap',marginTop:17}}><button className="btn primary" type="button" onClick={exportBadge}>Скачать карточку SVG</button><Link to="/race" className="btn secondary">Попробовать гонку →</Link><Link to="/classroom" className="btn secondary">Задания класса →</Link></div></div>
 </section>;
}
