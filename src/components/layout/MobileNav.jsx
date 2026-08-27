import { NavLink } from 'react-router-dom';
import { useAlerts } from '../../hooks/useData';
import { NAV_ITEMS } from './Sidebar';

/** Navigasi bawah untuk layar kecil — cermin dari sidebar desktop. */
export default function MobileNav() {
  const { unread } = useAlerts();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line-2 bg-parchment/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ to, label, shortLabel, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-2.5 text-[0.62rem] font-bold tracking-wide transition-colors ${
                  isActive ? 'text-forest' : 'text-sand'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`relative rounded-full px-3.5 py-1 transition-colors ${isActive ? 'bg-[#e3ede0]' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                    {to === '/notifikasi' && unread > 0 && (
                      <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-0.5 font-mono text-[0.56rem] font-semibold text-white">
                        {unread}
                      </span>
                    )}
                  </span>
                  <span>{shortLabel ?? label.split(' ')[0]}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
