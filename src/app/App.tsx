import {lazy,Suspense,Profiler,type ProfilerOnRenderCallback} from 'react';
import {Navigate,Outlet,Route,Routes} from 'react-router-dom';
import {Layout} from '../shared/ui/Layout';
import {Home} from '../features/home/Home';

// Keep the application chrome responsive while large specialist sections load.
// Vite produces route-specific chunks; the PWA precaches them for offline use.
// Home is eager to avoid a second network round-trip on cold mobile entry.
const Practice=lazy(()=>import('../features/practice/Practice').then(m=>({default:m.Practice})));
const Academy=lazy(()=>import('../features/academy/Academy').then(m=>({default:m.Academy})));
const Analytics=lazy(()=>import('../features/analytics/Analytics').then(m=>({default:m.Analytics})));
const Results=lazy(()=>import('../features/results/Results').then(m=>({default:m.Results})));
const Themes=lazy(()=>import('../features/themes/Themes').then(m=>({default:m.Themes})));
const Race=lazy(()=>import('../features/race/Race').then(m=>({default:m.Race})));
const Profile=lazy(()=>import('../features/profile/Profile').then(m=>({default:m.Profile})));
const Classroom=lazy(()=>import('../features/classroom/Classroom').then(m=>({default:m.Classroom})));

// Instrumented only when the benchmark opts in; Profiler is deliberately identical on both measurement branches.
const onPracticeCommit:ProfilerOnRenderCallback=()=>{
 const p=(window as unknown as {__TYKORA_BENCHMARK__?:{profilerCommits?:number}}).__TYKORA_BENCHMARK__;
 if(p)p.profilerCommits=(p.profilerCommits??0)+1;
};
export function App(){
 return <Routes>
  <Route element={<Layout/>}>
   <Route element={<Suspense fallback={<div role="status" className="sr-only">Загрузка раздела…</div>}><Outlet/></Suspense>}>
    <Route path="/" element={<Home/>}/>
    <Route path="/practice" element={<Profiler id="Practice" onRender={onPracticeCommit}><Practice/></Profiler>}/>
    <Route path="/academy" element={<Academy/>}/>
    <Route path="/analytics" element={<Analytics/>}/>
    <Route path="/result" element={<Results/>}/>
    <Route path="/themes" element={<Themes/>}/>
    <Route path="/race" element={<Race/>}/>
    <Route path="/profile" element={<Profile/>}/>
    <Route path="/classroom" element={<Classroom/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
   </Route>
  </Route>
 </Routes>;
}
