import {useEffect,useRef} from 'react';
import {NavLink,Outlet,useLocation} from 'react-router-dom';
import {useUiStore} from '../../app/store/uiStore';
import {useTranslation} from 'react-i18next';
import {languageNames,uiLocales,type InterfaceLocale} from '../i18n/catalog';
const links=[
 {href:'/',key:'home',icon:'⌂'}, {href:'/practice',key:'practice',icon:'⌨'},
 {href:'/academy',key:'academy',icon:'▤'}, {href:'/analytics',key:'analytics',icon:'↗'},
 {href:'/result',key:'result',icon:'◎'}, {href:'/race',key:'race',icon:'⚑'},
 {href:'/profile',key:'profile',icon:'✧'}, {href:'/classroom',key:'classroom',icon:'◫'},
 {href:'/themes',key:'themes',icon:'◐'}
] as const;
export function Layout(){
 const {t}=useTranslation();const {pathname}=useLocation();const previousRoute=useRef<string|null>(null);
 const initialize=useUiStore(s=>s.initialize),settings=useUiStore(s=>s.settings),updateSettings=useUiStore(s=>s.updateSettings),notice=useUiStore(s=>s.storageNotice);
 useEffect(()=>{void initialize();},[initialize]);
 useEffect(()=>{if(previousRoute.current!==null&&previousRoute.current!==pathname){document.getElementById('main-content')?.focus({preventScroll:true});}previousRoute.current=pathname;},[pathname]);
 const toggleDark=()=>{void updateSettings({themeName:settings.themeName==='Nightfall'?'Daylight':'Nightfall'});};
 const page=links.find(l=>l.href===pathname);
 const LinkItem=({link}:{link:typeof links[number]})=><NavLink end={link.href==='/'} className={({isActive})=>`navlink ${isActive?'active':''}`} to={link.href}><span className="navicon" aria-hidden="true">{link.icon}</span><span>{t(link.key)}</span></NavLink>;
 return <div className="app">
  <a href="#main-content" className="skip-link" tabIndex={0} onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>{t('skip')}</a>
  <aside className="sidebar">
   <NavLink className="brand" to="/"><span className="logo" aria-hidden="true"><i/><i/><i/><i/></span>TYKORA</NavLink>
   <div className="navtitle">{t('navMain')}</div>
   <nav className="nav" aria-label={t('navMain')}>{links.filter(l=>l.key!=='themes').map(l=><LinkItem link={l} key={l.key}/>)}</nav>
   <div className="navtitle" style={{marginTop:24}}>{t('navSettings')}</div>
   <nav className="nav" aria-label={t('navSettings')}><LinkItem link={links[8]}/></nav>
   <div className="spacer"/><div className="sidefoot"><span className="green-dot"/><b>{t('local')}</b><p>{t('noAccount')}</p><p>Typing core · v0.8</p></div>
  </aside>
  <main className="main" id="main-content" tabIndex={-1}>
   <div className="topbar"><span className="top-left">TYKORA / {t(page?.key??'home')}</span>
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
   <footer className="footer">TYKORA · {t('footer')} · v0.8</footer>
  </main>
  <nav className="bottom-nav" aria-label={t('navMain')}>{links.map(l=><LinkItem link={l} key={l.key}/>)}</nav>
 </div>;
}
export function PageHeader({kicker,title,children}:{kicker:string;title:string;children:React.ReactNode}){
 return <header className="pagehead"><div className="eyebrow">{kicker}</div><h1>{title}</h1><p className="lead">{children}</p></header>;
}
export function Kpi({label,value,note}:{label:string;value:string;note:string}){
 return <div className="kpi"><span className="muted small">{label}</span><div className="value">{value}</div><div className="meta">{note}</div></div>;
}
export function Placeholder({children}:{children:React.ReactNode}){return <div className="note">{children}</div>;}
