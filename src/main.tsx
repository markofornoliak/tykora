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
function bootstrap(){
 if(scheduled)return;
 scheduled=true;
 window.removeEventListener('hashchange',bootstrap);
 void import('./app/bootstrap').then(({mountApp})=>mountApp()).catch(error=>{
  console.error('TYKORA_BOOTSTRAP_FAILED',error);
 });
}
if(homeAtBootstrap){
 // Treat navigations occurring before hydration as urgent. Do not abandon
 // the static Home, and do not delay real route changes.
 window.addEventListener('hashchange',bootstrap);
 requestAnimationFrame(()=>requestAnimationFrame(bootstrap));
}else{
 // Deep links do not have matching prerendered route markup.
 bootstrap();
}
