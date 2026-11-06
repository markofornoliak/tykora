import {useEffect,useRef} from 'react';
import {Outlet,useLocation} from 'react-router-dom';
import {useUiStore} from '../../app/store/uiStore';
import {useTranslation} from 'react-i18next';
import {languageNames,uiLocales,type InterfaceLocale} from '../i18n/catalog';
const routes=[
 {href:'/',key:'home'},{href:'/home',key:'home'},
 {href:'/practice',key:'practice'},{href:'/academy',key:'academy'},
 {href:'/analytics',key:'analytics'},{href:'/result',key:'result'},
 {href:'/race',key:'race'},{href:'/profile',key:'profile'},
 {href:'/classroom',key:'classroom'},{href:'/themes',key:'themes'}
] as const;
export function Layout(){
 const {t}=useTranslation(),{pathname}=useLocation(),previousRoute=useRef<string|null>(null);
 const initialize=useUiStore(s=>s.initialize),settings=useUiStore(s=>s.settings);
 const updateSettings=useUiStore(s=>s.updateSettings),notice=useUiStore(s=>s.storageNotice);
 useEffect(()=>{const frame=requestAnimationFrame(()=>{void initialize();});return ()=>cancelAnimationFrame(frame);},[initialize]);
 useEffect(()=>{const skip=document.querySelector('[data-tykora-skip]');if(skip)skip.textContent=t('skip');},[t,settings.uiLocale]);
 useEffect(()=>{if(previousRoute.current!==null&&previousRoute.current!==pathname)document.getElementById('main-content')?.focus({preventScroll:true});previousRoute.current=pathname;},[pathname]);
 const toggleDark=()=>{void updateSettings({themeName:settings.themeName==='Nightfall'?'Daylight':'Nightfall'});};
 const page=routes.find(l=>l.href===pathname);
 return <>
  <div className="topbar"><span className="top-left">{'TYKORA / '+t(page?.key??'home')}</span>
   <div className="top-right">
    <span className="top-pill">{t('stored')}</span>
    <label className="sr-only" htmlFor="ui-locale">{t('language')}</label>
    <select className="locale-select" id="ui-locale" value={settings.uiLocale} onChange={e=>void updateSettings({uiLocale:e.target.value})}>
     {uiLocales.map(l=><option key={l} value={l}>{languageNames[l as InterfaceLocale]}</option>)}
    </select>
    <button type="button" className="icon-button" onClick={toggleDark} title={t('toggleTheme')} aria-label={t('toggleTheme')}>◐</button>
    <span className="avatar" aria-label={t('guest')}>T</span>
   </div>
  </div>
  {notice&&<div className="note warning" role="status">{notice}</div>}
  <Outlet/>
  <footer className="footer">{'TYKORA · '+t('footer')+' · Beta v0.9.0'}</footer>
 </>;
}
export function PageHeader({kicker,title,children}:{kicker:string;title:string;children:React.ReactNode}){
 return <header className="pagehead"><div className="eyebrow">{kicker}</div><h1>{title}</h1><p className="lead">{children}</p></header>;
}
export function Kpi({label,value,note}:{label:string;value:string;note:string}){
 return <div className="kpi"><span className="muted small">{label}</span><div className="value">{value}</div><div className="meta">{note}</div></div>;
}
export function Placeholder({children}:{children:React.ReactNode}){return <div className="note">{children}</div>;}
