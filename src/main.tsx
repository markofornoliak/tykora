// Native <main> and skip link live outside both replaceable React roots.
import './styles/app.css';
import './shared/theme/tokens.css';
import './shared/theme/heatmap.css';
import './shared/theme/home.css';
const root=document.getElementById('root'),chrome=document.getElementById('chrome-root');
if(!root||!chrome)throw Error('TYKORA native shell missing');
function homeHash(){return !location.hash||location.hash==='#'||location.hash==='#/'||location.hash==='#/home';}
const hydrateHome=homeHash()&&root.dataset.tykoraHomePrerender==='1';
let scheduled=false,mainReady=false,chromeReady=false;
function checkReady(){
 if(!mainReady||!chromeReady)return;
 document.documentElement.removeAttribute('data-tykora-deep-link');
 window.removeEventListener('click',beforeHydrationNavigation,true);
 window.removeEventListener('hashchange',trackRoute);
}
window.addEventListener('tykora:hydrated',()=>{mainReady=true;checkReady();});
window.addEventListener('tykora:chrome-hydrated',()=>{chromeReady=true;checkReady();});
function trackRoute(){if(!homeHash())document.documentElement.dataset.tykoraDeepLink='1';}
function beforeHydrationNavigation(event:MouseEvent){
 if((mainReady&&chromeReady)||event.button!==0||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
 const target=event.target;if(!(target instanceof Element))return;
 const link=target.closest('a[href^="#/"]');
 if(!link||!(chrome?.contains(link)||root?.contains(link)))return;
 const href=link.getAttribute('href');if(!href)return;
 event.preventDefault();window.location.hash=href;trackRoute();bootstrap();
}
window.addEventListener('click',beforeHydrationNavigation,true);
window.addEventListener('hashchange',trackRoute);
function bootstrap(){
 if(scheduled)return;
 scheduled=true;
 void import('./app/bootstrap').then(({mountApp})=>mountApp()).catch(error=>console.error('TYKORA_BOOTSTRAP_FAILED',error));
}
if(hydrateHome){
 window.addEventListener('hashchange',bootstrap,{once:true});
 requestAnimationFrame(()=>requestAnimationFrame(bootstrap));
}else{
 document.documentElement.dataset.tykoraDeepLink='1';
 root.replaceChildren();chrome.replaceChildren();
 delete root.dataset.tykoraHomePrerender;delete chrome.dataset.tykoraChromePrerender;
 bootstrap();
}
