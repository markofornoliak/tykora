import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../shared/ui/Layout';
import { Home } from '../features/home/Home';
import { Practice } from '../features/practice/Practice';
import { Academy } from '../features/academy/Academy';
import { Analytics } from '../features/analytics/Analytics';
import { Results } from '../features/results/Results';
import { Themes } from '../features/themes/Themes';
import {Race} from '../features/race/Race';
import {Profile} from '../features/profile/Profile';
import {Classroom} from '../features/classroom/Classroom';
export function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/academy" element={<Academy />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/result" element={<Results />} />
      <Route path="/themes" element={<Themes />} />
      <Route path="/race" element={<Race />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/classroom" element={<Classroom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
