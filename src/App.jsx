import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import Dasbor from './pages/Dasbor';
import Peta from './pages/Peta';
import Kamera from './pages/Kamera';
import Notifikasi from './pages/Notifikasi';
import Pengaturan from './pages/Pengaturan';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppShell />}>
        <Route path="/dasbor" element={<Dasbor />} />
        <Route path="/peta" element={<Peta />} />
        <Route path="/kamera" element={<Kamera />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
        <Route path="/pengaturan" element={<Pengaturan />} />
      </Route>
    </Routes>
  );
}
