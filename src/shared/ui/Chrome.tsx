import {useEffect,useState} from 'react';
import {useTranslation} from 'react-i18next';
const links=[
 {href:'/',key:'home',icon:'⌂'},{href:'/practice',key:'practice',icon:'⌨'},
 {href:'/academy',key:'academy',icon:'▤'},{href:'/analytics',key:'analytics',icon:'↗'},
 {href:'/result',key:'result',icon:'◎'},{href:'/race',key:'race',icon:'⚑'},
 {href:'/profile',key:'profile',icon:'✧'},{href:'/classroom',key:'classroom',icon:'◫'},
 {href:'/themes',key:'themes',icon:'◐'}
] as const;
function currentPath(){return window.location.hash.replace(/^#/,'')||'/';}
export function Chrome(){
 const {t}=useTranslation();
 const [pathname,setPathname]=useState(currentPath);
 useEffect(()=>{
  // Hash anchors trigger native hashchange. Main-router Link navigation uses
  // history.pushState, so App emits the explicit route-changed event as well.
  const sync=()=>setPathname(currentPath());
  window.addEventListener('hashchange',sync);
  window.addEventListener('tykora:route-changed',sync);
  window.dispatchEvent(new Event('tykora:chrome-hydrated'));
  return ()=>{
   window.removeEventListener('hashchange',sync);
   window.removeEventListener('tykora:route-changed',sync);
  };
 },[]);
 const isActive=(path:string)=>path==='/'?(pathname==='/'||pathname==='/home'):pathname===path;
 const LinkItem=({link}:{link:typeof links[number]})=>{
  const active=isActive(link.href);
  return <a href={'#'+link.href} data-discover="true" aria-current={active?'page':undefined}
   className={'navlink '+(active?'active':'')}>
   <span className="navicon" aria-hidden="true">{link.icon}</span><span>{t(link.key)}</span>
  </a>;
 };
 return <>
  <aside className="sidebar">
   <a className={'brand '+(isActive('/')?'active':'')} href="#/" data-discover="true"
    aria-current={isActive('/')?'page':undefined}>
    <span className="logo" aria-hidden="true"><i/><i/><i/><i/></span>TYKORA
   </a>
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
