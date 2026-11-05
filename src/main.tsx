import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './app/i18n';
import './styles/app.css';
import './shared/theme/tokens.css';
import './shared/theme/heatmap.css';
import './shared/theme/home.css';
import { App } from './app/App';

const root=document.getElementById('root')!;
const app=<React.StrictMode><HashRouter><App /></HashRouter></React.StrictMode>;
const hash=window.location.hash;
const homeAtBootstrap=!hash||hash==='#'||hash==='#/';
if(homeAtBootstrap&&root.dataset.tykoraHomePrerender==='1'){
  // The checked-in markup is an exact clean-profile Home DOM capture, not
  // decorative placeholder text. Hydrate to retain the existing LCP heading.
  ReactDOM.hydrateRoot(root,app,{
    onRecoverableError:(error,info)=>{
      // Never suppress or silently mask a hydration mismatch; the React
      // component stack identifies the first inconsistent subtree in CI.
      console.error('TYKORA_HOME_HYDRATION_RECOVERABLE',error,'componentStack',info.componentStack);
    }
  });
}else{
  // A deep-linked route must never show the static Home while JS initializes.
  root.replaceChildren();
  ReactDOM.createRoot(root).render(app);
}

// Inline critical paint rules must not override the complete, versioned
// stylesheet in the settled interactive UI. The load event guarantees that
// render-blocking CSS resources are available before removing the fallback.
function releaseCriticalHomeCss(){
 document.querySelector('style[data-tykora-critical]')?.remove();
}
if(document.readyState==='complete')releaseCriticalHomeCss();
else window.addEventListener('load',releaseCriticalHomeCss,{once:true});
