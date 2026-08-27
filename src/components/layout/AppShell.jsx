import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Topbar from './Topbar';
import { pageTransition } from '../../lib/motion';

/**
 * Kerangka semua halaman dasbor:
 * desktop → sidebar kiri tetap; mobile → topbar ringkas + navigasi bawah.
 */
export default function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-cream">
      <Sidebar />
      <div className="min-h-dvh pb-24 lg:ml-[280px] lg:pb-0">
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            className="px-5 pt-6 pb-10 md:px-8 md:pt-8 lg:px-11 lg:pt-[34px]"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <MobileNav />
    </div>
  );
}
