import { Link } from 'react-router-dom';
import { Bell, ChevronDown, MapPinned } from 'lucide-react';
import { useAlerts } from '../../hooks/useData';

export default function Topbar() {
  const { unread } = useAlerts();

  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-3.5 md:px-8 lg:px-11">
      {/* breadcrumb lokasi — mobile: logo */}
      <div className="hidden items-center gap-2.5 text-[0.86rem] text-sage md:flex">
        <MapPinned size={15} className="text-sand" />
        <span>Kalimantan Timur</span>
        <span className="text-[#c9c0ad]">/</span>
        <span className="font-semibold text-ink">Kawasan Inti</span>
      </div>
      <Link to="/" className="flex items-center gap-2.5 md:hidden">
        <img src="/img/logo-emblem.png" alt="" className="h-8 w-8 object-contain" />
        <span className="font-display text-[0.98rem] font-bold text-ink">
          Forestguard <span className="text-forest">IKN</span>
        </span>
      </Link>

      <div className="flex items-center gap-3 md:gap-4">
        <Link
          to="/notifikasi"
          aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line-2 bg-paper text-[#5f6b5e] transition-colors hover:border-forest/40 hover:text-forest"
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute top-2 right-2.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-paper bg-amber" />
          )}
        </Link>
        <button className="hidden items-center gap-2.5 rounded-full border border-line-2 bg-paper py-[5px] pr-2 pl-[5px] transition-colors hover:border-forest/40 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-[0.82rem] font-bold text-white">FG</span>
          <span className="text-[0.85rem] font-semibold">Forestguard-IKN</span>
          <ChevronDown size={13} className="mr-1 text-sand" />
        </button>
      </div>
    </div>
  );
}
