import {useEffect} from 'react';
import {NavLink,useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
const links=[
 {href:'/',key:'home',icon:'⌂'},{href:'/practice',key:'practice',icon:'⌨'},
 {href:'/academy',key:'academy',icon:'▤'},{href:'/analytics',key:'analytics',icon:'↗'},
 {href:'/result',key:'result',icon:'◎'},{href:'/race',key:'race',icon:'⚑'},
 {href:'/profile',key:'profile',icon:'✧'},{href:'/classroom',key:'classroom',icon:'◫'},
 {href:'/themes',key:'themes',icon:'◐'}
] as const;
export function Chrome(){
 const {t}=useTranslation(),{pathname}=useLocation();
 useEffect(()=>{window.dispatchEvent(new Event('tykora:chrome-hydrated'));},[]);
 const LinkItem=({link}:{link:typeof links[number]})=><NavLink end={link.href==='/'} to={link.href}
  className={({isActive})=>'navlink '+(isActive||(link.href==='/'&&pathname==='/home')?'active':'')}>
  <span className="navicon" aria-hidden="true">{link.icon}</span><span>{t(link.key)}</span>
 </NavLink>;
 return <>
  <aside className="sidebar">
   <NavLink className={({isActive})=>'brand '+(isActive||pathname==='/home'?'active':'')} to="/">
    <span className="logo" aria-hidden="true"><i/><i/><i/><i/></span>TYKORA
   </NavLink>
   <div className="navtitle">{t('navMain')}</div>
   <nav className="nav" aria-label={t('navMain')}>{links.filter(l=>l.key!=='themes').map(l=><LinkItem link={l} key={l.key}/>)}</nav>
   <div className="navtitle" style={{marginTop:24}}>{t('navSettings')}</div>
   <nav className="nav" aria-label={t('navSettings')}><LinkItem link={links[8]}/></nav>
   <div className="spacer"/>
   <div className="sidefoot"><span className="green-dot"/><b>{t('local')}</b><p>{t('noAccount')}</p><p>Typing core · Beta v0.9.0</p></div>
  </aside>
  <nav className="bottom-nav" aria-label={t('navMain')}>{links.map(l=><LinkItem link={l} key={l.key}/>)}</nav>
 </>;
}
