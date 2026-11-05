import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import './i18n';
import {App} from './App';

/** Mount exactly once: Home hydrates its real static DOM, deep links render. */
export function mountApp(){
 const root=document.getElementById('root');
 if(!root)throw new Error('TYKORA root element missing');
 const app=<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>;
 const hash=window.location.hash;
 const homeNow=!hash||hash==='#'||hash==='#/';
 if(homeNow&&root.dataset.tykoraHomePrerender==='1'){
  ReactDOM.hydrateRoot(root,app,{
   onRecoverableError:(error,info)=>{
    console.error('TYKORA_HOME_HYDRATION_RECOVERABLE',error,'componentStack',info.componentStack);
   }
  });
 }else{
  root.replaceChildren();
  ReactDOM.createRoot(root).render(app);
 }
}
