import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Wind, Unplug, CloudUpload, Thermometer, CircleCheck, CheckCheck, BellOff } from 'lucide-react';
import { useAlerts } from '../hooks/useData';
import { markAllAlertsRead } from '../services/dataProvider';
import { stagger, fadeUp, EASE } from '../lib/motion';
import PageHeader from '../components/ui/PageHeader';

const CAT_STYLE = {
  critical: { color: '#c0392b', bg: '#fbeae7' },
  warning: { color: '#d08a1e', bg: '#fbf1dd' },
  info: { color: '#2f7048', bg: '#e6f1e8' },
};

/* ikon per judul alert — dipetakan dari kata kunci agar tetap jalan dengan data backend */
function alertIcon(a) {
  const t = a.title.toLowerCase();
  if (t.includes('kebakaran') || t.includes('api')) return Flame;
  if (t.includes('gas')) return Wind;
  if (t.includes('offline') || t.includes('sinyal')) return Unplug;
  if (t.includes('suhu')) return Thermometer;
  if (t.includes('sinkronisasi')) return CloudUpload;
  return CircleCheck;
}

const TABS = [
  ['all', 'Semua'],
  ['critical', 'Kritis'],
  ['warning', 'Peringatan'],
  ['info', 'Info'],
];

export default function Notifikasi() {
  const { alerts, unread } = useAlerts();
  const [filter, setFilter] = useState('all');
  const shown = alerts.filter((a) => filter === 'all' || a.cat === filter);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        eyebrow="Riwayat Aktivitas"
        title="Pusat Notifikasi"
        description={
          <>
            Peringatan dan aktivitas sistem ·{' '}
            <span className="font-bold text-danger">{unread} belum dibaca</span>
          </>
        }
      >
        <button
          onClick={markAllAlertsRead}
          disabled={unread === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-[0.87rem] font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <CheckCheck size={16} />
          Tandai Semua Dibaca
        </button>
      </PageHeader>

      {/* filter kategori */}
      <motion.div variants={fadeUp} className="mb-6 flex flex-wrap gap-2.5">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-5 py-2.5 text-[0.85rem] font-bold transition-colors ${
              filter === key
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-paper text-moss hover:border-sand hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* daftar */}
      <motion.div variants={fadeUp} className="flex flex-col gap-3.5">
        <AnimatePresence mode="popLayout">
          {shown.map((a) => {
            const s = CAT_STYLE[a.cat];
            const Icon = alertIcon(a);
            return (
              <motion.div
                layout
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`flex items-center gap-4 rounded-2xl border border-line border-l-4 px-5 py-5 ${a.read ? 'bg-mist' : 'bg-paper'}`}
                style={{ borderLeftColor: s.color }}
              >
                <div
                  className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[13px]"
                  style={{ background: s.bg, color: s.color }}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[1rem] font-bold text-ink">{a.title}</div>
                    <div className="whitespace-nowrap font-mono text-[0.72rem] font-medium text-sand">{a.time}</div>
                  </div>
                  <div className="mt-1 text-[0.9rem] leading-normal text-moss">{a.msg}</div>
                </div>
                {!a.read && <span className="h-[11px] w-[11px] shrink-0 rounded-full bg-danger" aria-label="Belum dibaca" />}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {shown.length === 0 && (
          <div className="py-16 text-center text-sand">
            <BellOff size={44} className="mx-auto text-[#d8ddd6]" />
            <div className="mt-4 font-semibold">Tidak ada notifikasi pada kategori ini</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
