import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuroraBackground } from '@/components/AuroraBackground';
import { TabBar } from '@/components/TabBar';
import { Admin } from '@/screens/Admin';
import { GameDetail } from '@/screens/GameDetail';
import { Home } from '@/screens/Home';
import { HostRoom } from '@/screens/HostRoom';
import { JoinRoom } from '@/screens/JoinRoom';
import { Library } from '@/screens/Library';
import { Party } from '@/screens/Party';
import { Play } from '@/screens/Play';
import { Settings } from '@/screens/Settings';

/** Routes that take over the screen — no bottom navigation while playing. */
const IMMERSIVE = [/^\/play\//, /^\/host/, /^\/join/, /^\/admin/];

export function App() {
  const location = useLocation();
  const immersive = IMMERSIVE.some((re) => re.test(location.pathname));

  return (
    <div className="grain relative min-h-dvh">
      <AuroraBackground />
      {/*
        No route-level <AnimatePresence>: a `mode="wait"` presence at the top
        parks every *nested* AnimatePresence child at its `initial` values, so
        bottom sheets rendered off-screen and card swaps never appeared. Each
        <Screen> animates itself in, which is all the route transition needs.
      */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Library />} />
        <Route path="/g/:id" element={<GameDetail />} />
        <Route path="/play/:id" element={<Play />} />
        <Route path="/party" element={<Party />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/host" element={<HostRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/join/:code" element={<JoinRoom />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!immersive && <TabBar />}
    </div>
  );
}
