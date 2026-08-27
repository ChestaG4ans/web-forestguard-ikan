import { motion } from 'framer-motion';
import { Satellite } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip as LTooltip } from 'react-leaflet';
import L from 'leaflet';
import { useNodes } from '../hooks/useData';
import { stagger, fadeUp } from '../lib/motion';
import PageHeader from '../components/ui/PageHeader';

const PIN_COLOR = { on: '#2f7048', warn: '#d08a1e', off: '#c0392b' };

const pinIcon = (status) =>
  L.divIcon({ className: '', html: `<div class="fg-pin ${status}"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] });

const LEGEND = [
  { color: '#2f7048', label: 'Aktif & Aman' },
  { color: '#d08a1e', label: 'Perlu Perhatian' },
  { color: '#c0392b', label: 'Offline' },
];

export default function Peta() {
  const nodes = useNodes();
  const aktif = nodes.filter((n) => n.status !== 'off').length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        eyebrow="Peta Sebaran Node"
        title="Peta Kawasan IKN"
        description="Lokasi sensor & titik pemantauan realtime"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-[#c9e2cf] bg-[#e6f1e8] px-5 py-2.5 text-[0.9rem] font-bold text-ok">
          <Satellite size={16} />
          {aktif} dari {nodes.length} Node Aktif
        </div>
      </PageHeader>

      <motion.div
        variants={fadeUp}
        className="relative h-[calc(100dvh-330px)] min-h-[420px] overflow-hidden rounded-[22px] border border-line shadow-[0_10px_30px_rgba(20,48,77,0.06)] lg:h-[calc(100dvh-260px)]"
      >
        <MapContainer
          center={[-1.034, 116.735]}
          zoom={13}
          scrollWheelZoom={false}
          className="absolute inset-0 z-[1]"
        >
          <TileLayer
            attribution="© OpenStreetMap · © CARTO"
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {nodes.map((n) => (
            <Circle
              key={`${n.id}-radius`}
              center={[n.lat, n.lng]}
              radius={n.radiusMeters || 1000}
              pathOptions={{
                color: PIN_COLOR[n.status], weight: 1.5, opacity: 0.7,
                fillColor: PIN_COLOR[n.status], fillOpacity: 0.12, dashArray: '5 6',
              }}
            >
              <LTooltip sticky>Jangkauan ± {((n.radiusMeters || 1000) / 1000).toFixed(1)} km</LTooltip>
            </Circle>
          ))}
          {nodes.map((n) => (
            <Marker key={n.id} position={[n.lat, n.lng]} icon={pinIcon(n.status)}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="mb-1 text-[0.98rem] font-extrabold text-ink">{n.name}</div>
                  <div className="mb-2 text-[0.8rem] font-bold" style={{ color: PIN_COLOR[n.status] }}>
                    {n.statusLabel}
                  </div>
                  <div className="text-[0.82rem] leading-normal text-moss">
                    {n.status === 'off'
                      ? `Sinyal terputus sejak ${n.lastSeen}`
                      : `Suhu ${n.suhu}°C · Kelembapan ${n.kelembapan}% · Gas ${n.gas} PPM`}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* legenda */}
        <div className="absolute bottom-5 left-5 z-[500] min-w-[180px] rounded-2xl border border-line bg-paper px-4 py-4">
          <div className="mb-3 text-[0.7rem] font-bold tracking-[0.14em] text-sand uppercase">Status Node</div>
          <div className="flex flex-col gap-2.5">
            {LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-2.5 text-[0.85rem] font-semibold text-[#5f6b5e]">
                <span className="h-[11px] w-[11px] rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
