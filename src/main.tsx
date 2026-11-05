// Home ships the complete, semantic first-visit markup in index.html.
// CSS is eager; the interactive React runtime is scheduled after the first
// rendering opportunity. This is the SAME path for users and lab browsers.
import './styles/app.css';
import './shared/theme/tokens.css';
import './shared/theme/heatmap.css';
import './shared/theme/home.css';

const root=document.getElementById('root');
if(!root)throw new Error('TYKORA root element missing');
const hash=window.location.hash;
const homeAtBootstrap=(!hash||hash==='#'||hash==='#/')
  &&root.dataset.tykoraHomePrerender==='1';
let scheduled=false;
let mounted=false;
// hydrateRoot schedules hydration and returns before React has committed it.
// Keep native hash-link delegation until React actually commits App.
window.addEventListener('tykora:hydrated',()=>{
 mounted=true;
 window.removeEventListener('click',prerenderNavigation,true);
},{once:true});
/** Keep links functional while the initial Home is still awaiting React.
 * A capture handler commits user navigation synchronously; the matching
 * React Router route mounts once the normal runtime finishes loading.
 */
function prerenderNavigation(event:MouseEvent){
 if(mounted||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
 const target=event.target;
 if(!(target instanceof Element))return;
 const link=target.closest('a[href^="#/"]');
 if(!link||!root?.contains(link))return;
 const href=link.getAttribute('href');
 if(!href)return;
 event.preventDefault();
 window.location.hash=href;
 bootstrap();
}
window.addEventListener('click',prerenderNavigation,true);
function bootstrap(){
 if(scheduled)return;
 scheduled=true;
 window.removeEventListener('hashchange',bootstrap);
 void import('./app/bootstrap').then(({mountApp})=>{
  mountApp();
 }).catch(error=>{
  console.error('TYKORA_BOOTSTRAP_FAILED',error);
 });
}
if(homeAtBootstrap){
 // Treat navigations occurring before hydration as urgent. Do not abandon
 // the static Home, and do not delay real route changes.
 window.addEventListener('hashchange',bootstrap);
 requestAnimationFrame(()=>requestAnimationFrame(bootstrap));
}else{
 // Deep links must never expose stale, unhydrated Home controls. Clear the
 // wrong-route static DOM BEFORE dynamic module loading, not after it.
 root.replaceChildren();
 bootstrap();
}
