import { NavLink, Link } from 'react-router-dom';
import { LayoutGrid, Map, Video, Bell, Settings, RadioTower } from 'lucide-react';
import { useAlerts } from '../../hooks/useData';

export const NAV_ITEMS = [
  { to: '/dasbor', label: 'Dasbor', icon: LayoutGrid },
  { to: '/peta', label: 'Peta Kawasan', icon: Map },
  { to: '/kamera', label: 'Pemantauan Kamera', icon: Video, shortLabel: 'Kamera' },
  { to: '/notifikasi', label: 'Notifikasi', icon: Bell },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar() {
  const { unread } = useAlerts();

  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-[280px] flex-col overflow-hidden border-r border-line-2 bg-parchment px-[18px] pt-[26px] pb-4 lg:flex">
      {/* ambien: treeline + burung */}
      <div aria-hidden className="ambient pointer-events-none absolute right-0 bottom-[128px] left-0 z-0 h-[118px] opacity-90">
        <img
          src="/img/forest-treeline.png"
          alt=""
          className="absolute bottom-0 left-0 h-[82px] w-full object-cover object-bottom opacity-45 [mask-image:linear-gradient(180deg,transparent,#000_60%)]"
        />
        <svg viewBox="0 0 40 12" className="absolute top-0 left-11 w-6 text-sage opacity-35" style={{ animation: 'fg-bird 16s ease-in-out infinite' }}>
          <path d="M2 10 Q10 2 20 8 Q30 2 38 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <svg viewBox="0 0 40 12" className="absolute top-4 right-12 w-[18px] text-sage opacity-28" style={{ animation: 'fg-bird-2 20s ease-in-out infinite 1.5s' }}>
          <path d="M2 10 Q10 2 20 8 Q30 2 38 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* logo */}
      <Link to="/" className="relative z-10 mb-2 flex items-center gap-3 border-b border-line pb-5 pl-1.5">
        <img src="/img/logo-emblem.png" alt="FORESTGUARD-IKN" className="h-[46px] w-[46px] shrink-0 object-contain" />
        <div className="leading-none">
          <div className="font-display text-[1.18rem] font-bold tracking-tight text-ink">
            Forestguard <span className="text-forest">IKN</span>
          </div>
          <div className="mt-1 font-mono text-[0.58rem] font-medium tracking-[0.22em] text-gold">PKM-KC · 2026</div>
        </div>
      </Link>

      {/* navigasi */}
      <nav className="relative z-10 flex-1">
        <div className="mx-3.5 mt-2.5 mb-3.5 text-[0.62rem] font-bold tracking-[0.22em] text-sand uppercase">Ruang Kendali</div>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl border-l-[3px] px-4 py-3 text-[0.94rem] font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'border-forest bg-[#e3ede0] text-ink'
                      : 'border-transparent text-moss hover:bg-[#ece8dc] hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={isActive ? 2.4 : 2} className={isActive ? 'text-forest' : ''} />
                    <span>{label}</span>
                    {to === '/notifikasi' && unread > 0 && (
                      <span className="ml-auto flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-forest px-1.5 font-mono text-[0.72rem] font-semibold text-cream">
                        {unread}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* status sistem */}
      <div className="relative z-10 rounded-[14px] border border-[#dde7d6] bg-[#eef3e9] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[0.82rem] font-bold text-forest">
            <RadioTower size={15} className="anim-pulse-dot" />
            Sistem aktif
          </div>
          <span className="font-mono text-[0.74rem] font-semibold text-[#5f8a6c]">100%</span>
        </div>
        <div className="mt-2 text-[0.74rem] leading-normal text-moss">
          3 node terhubung
          <br />
          Kawasan Inti IKN
        </div>
      </div>

      <div className="relative z-10 mt-3.5 border-t border-line pt-3.5 text-[0.62rem] font-bold tracking-[0.16em] text-sand uppercase">
        Pusat Monitoring · Node 01
      </div>
    </aside>
  );
}
