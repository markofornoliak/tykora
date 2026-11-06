import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import './i18n';
import {App} from './App';
import {Chrome} from '../shared/ui/Chrome';
export function mountApp(){
 const root=document.getElementById('root'),chrome=document.getElementById('chrome-root');
 if(!root||!chrome)throw Error('TYKORA native roots missing');
 const home=!location.hash||location.hash==='#'||location.hash==='#/'||location.hash==='#/home';
 const content=<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>;
 const navigation=<React.StrictMode><HashRouter><Chrome/></HashRouter></React.StrictMode>;
 if(home&&root.dataset.tykoraHomePrerender==='1'){
  ReactDOM.hydrateRoot(root,content,{onRecoverableError:(error,info)=>console.error('TYKORA_HOME_HYDRATION_RECOVERABLE',error,'componentStack',info.componentStack)});
 }else{root.replaceChildren();ReactDOM.createRoot(root).render(content);}
 if(home&&chrome.dataset.tykoraChromePrerender==='1'){
  ReactDOM.hydrateRoot(chrome,navigation,{onRecoverableError:(error,info)=>console.error('TYKORA_CHROME_HYDRATION_RECOVERABLE',error,'componentStack',info.componentStack)});
 }else{chrome.replaceChildren();ReactDOM.createRoot(chrome).render(navigation);}
}
