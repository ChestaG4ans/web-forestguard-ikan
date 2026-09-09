import { motion } from 'framer-motion';
import { Thermometer, Wind, AudioWaveform, Flame, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTelemetry, useNodes } from '../hooks/useData';
import { stagger, fadeUp } from '../lib/motion';
import StatusPill from '../components/ui/StatusPill';

const fmt1 = (v) => v.toFixed(1).replace('.', ',');
const jam = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function SensorCard({ nodeId, data, isActive }) {
  if (!isActive || !data) {
    return (
      <div className="min-w-0 animate-pulse rounded-2xl bg-[#f0ebe0] p-6">
        <div className="h-4 w-20 rounded bg-[#e0dbd0]" />
        <div className="mt-4 h-12 w-24 rounded bg-[#e0dbd0]" />
      </div>
    );
  }

  const { suhu, gas, flame, waktu } = data;
  const suhuWarn = suhu > 50;
  const gasWarn = gas > 1000;
  const adaBahaya = flame || suhuWarn || gasWarn;

  return (
    <div className={`min-w-0 rounded-2xl border p-6 ${flame ? 'border-danger bg-danger/5' : 'border-line bg-paper'}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 text-[0.68rem] font-bold tracking-[0.18em] text-canopy uppercase">
            Node {nodeId}
          </div>
          <StatusPill tone={flame ? 'danger' : adaBahaya ? 'warn' : 'ok'}>
            {flame ? '🔥 API!' : adaBahaya ? '⚠️ Waspada' : '✓ Aman'}
          </StatusPill>
        </div>
        {flame ? (
          <div className="animate-pulse">
            <Flame size={28} className="text-danger" />
          </div>
        ) : (
          <ShieldCheck size={28} className="text-ok" />
        )}
      </div>

      {/* Suhu */}
      <div className="mb-4">
        <div className="mb-2 flex items-end gap-2">
          <span className={`font-mono text-[2.5rem] leading-none font-medium ${suhuWarn ? 'text-danger' : 'text-ink'}`}>
            {fmt1(suhu)}
          </span>
          <span className="mb-2 text-[1rem] text-sage">°C</span>
        </div>
        <div className="flex items-center gap-2 text-[0.72rem] text-sand">
          <Thermometer size={12} />
          Suhu udara
        </div>
      </div>

      {/* Gas */}
      <div className="border-t border-line pt-4">
        <div className="mb-2 flex items-end gap-2">
          <span className={`font-mono text-[2rem] leading-none font-medium ${gasWarn ? 'text-amber' : 'text-ink'}`}>
            {Math.round(gas)}
          </span>
          <span className="mb-1.5 text-[0.9rem] text-sage">ppm</span>
        </div>
        <div className="flex items-center gap-2 text-[0.72rem] text-sand">
          <Wind size={12} />
          Kadar gas
        </div>
      </div>

      {/* Flame Status */}
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {flame ? (
              <>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-danger">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
                <span className="font-bold text-danger">API TERDETEKSI</span>
              </>
            ) : (
              <>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ok">
                  <span className="text-xs font-bold text-white">✓</span>
                </div>
                <span className="font-semibold text-ok">Tidak Ada Api</span>
              </>
            )}
          </div>
          <span className={`text-lg font-bold ${flame ? 'text-danger' : 'text-ok'}`}>
            {flame ? 'TRUE' : 'FALSE'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-line pt-3">
        <div className="text-[0.68rem] text-sand">
          Diperbarui {jam(waktu)}
        </div>
      </div>
    </div>
  );
}

function NodeComparison({ n1, n2 }) {
  if (!n1 && !n2) return null;

  const data = [
    { label: 'Suhu', n1Val: n1?.suhu, n2Val: n2?.suhu, unit: '°C', n1Warn: n1?.suhu > 50, n2Warn: n2?.suhu > 50 },
    { label: 'Gas', n1Val: n1?.gas, n2Val: n2?.gas, unit: 'ppm', n1Warn: n1?.gas > 1000, n2Warn: n2?.gas > 1000 },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="border-b border-line px-6 py-4">
        <div className="mb-1.5 text-[0.68rem] font-bold tracking-[0.18em] text-canopy uppercase">
          Perbandingan Node
        </div>
        <div className="font-display text-[1.2rem] font-bold text-ink">N1 vs N2</div>
      </div>
      <div className="p-6">
        {data.map((item) => (
          <div key={item.label} className="mb-4 last:mb-0">
            <div className="mb-2 text-[0.82rem] font-semibold text-moss">{item.label}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-xl p-3 ${item.n1Warn ? 'bg-danger/10' : 'bg-cream'}`}>
                <div className="mb-1 text-[0.68rem] font-bold text-canopy">N1</div>
                <div className={`font-mono text-[1.5rem] font-semibold ${item.n1Warn ? 'text-danger' : 'text-ink'}`}>
                  {item.n1Val != null ? fmt1(item.n1Val) : '--'}{item.unit}
                </div>
              </div>
              <div className={`rounded-xl p-3 ${item.n2Warn ? 'bg-danger/10' : 'bg-cream'}`}>
                <div className="mb-1 text-[0.68rem] font-bold text-canopy">N2</div>
                <div className={`font-mono text-[1.5rem] font-semibold ${item.n2Warn ? 'text-danger' : 'text-ink'}`}>
                  {item.n2Val != null ? fmt1(item.n2Val) : '--'}{item.unit}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dasbor() {
  const n1Data = useTelemetry('N1');
  const n2Data = useTelemetry('N2');
  const nodes = useNodes();

  // Combined status
  const adaApi = n1Data?.flame || n2Data?.flame;
  const adaWaspada = (n1Data?.suhu > 50 || n1Data?.gas > 1000) || (n2Data?.suhu > 50 || n2Data?.gas > 1000);
  const kondisi = adaApi ? '🔥 BAHAYA!' : adaWaspada ? '⚠️ Perlu Perhatian' : '✓ Kondisi Aman';
  const kondisiWarna = adaApi ? 'danger' : adaWaspada ? 'amber' : 'forest';

  // Loading state
  if (!n1Data && !n2Data) {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <div className="h-32 w-1/2 animate-pulse rounded-2xl bg-[#f0ebe0]" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-[#f0ebe0]" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* hero halaman */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-7">
        <div className="max-w-[560px]">
          <div className="mb-3 text-[0.68rem] font-bold tracking-[0.18em] text-canopy uppercase">
            Pemantauan Realtime · N1 & N2
          </div>
          <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none font-bold tracking-tight text-ink">
            Kawasan Inti <span className="text-forest">IKN</span>
          </h1>
          <p className="mt-4 leading-relaxed text-moss [text-wrap:pretty]">
            Sistem membaca kondisi sensor dari 2 node pemantau.
          </p>
        </div>
        <div className="flex items-center gap-4 pt-1.5">
          <div className="h-[46px] w-0.5 bg-[#c9c0ad]" />
          <div>
            <div className={`flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.16em] uppercase text-${kondisiWarna}`}>
              <span className={`h-2 w-2 rounded-full bg-${kondisiWarna} ${adaApi ? 'animate-pulse' : ''}`} />
              {kondisi}
            </div>
            <div className="mt-1.5 text-[0.82rem] text-sage">
              {nodes.length} Node Aktif
            </div>
          </div>
        </div>
      </motion.div>

      {/* Flame Alert Banner */}
      {adaApi && (
        <motion.div
          variants={fadeUp}
          className="mt-6 flex items-center justify-center gap-3 rounded-2xl border-2 border-danger bg-danger/10 p-6"
        >
          <Flame size={32} className="animate-pulse text-danger" />
          <div>
            <div className="text-center text-[1.2rem] font-bold text-danger">PERINGATAN!</div>
            <div className="text-center text-[0.9rem] text-danger">Api terdeteksi di salah satu node!</div>
          </div>
          <Flame size={32} className="animate-pulse text-danger" />
        </motion.div>
      )}

      {/* sensor cards */}
      <motion.section variants={fadeUp} className="mt-6">
        <div className="mb-4">
          <div className="mb-1.5 text-[0.68rem] font-bold tracking-[0.18em] text-canopy uppercase">
            Telemetri Langsung
          </div>
          <div className="font-display text-[1.45rem] font-bold text-ink">Pembacaan Sensor</div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SensorCard nodeId="N1" data={n1Data} isActive={!!n1Data} />
          <SensorCard nodeId="N2" data={n2Data} isActive={!!n2Data} />
        </div>
      </motion.section>

      {/* perbandingan + kesehatan node */}
      <motion.section variants={fadeUp} className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <NodeComparison n1={n1Data} n2={n2Data} />

        {/* kartu kesehatan node */}
        <div className="flex min-w-0 flex-col rounded-2xl bg-pine p-6 text-[#e8ece2]">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1.5 text-[0.68rem] font-bold tracking-[0.18em] text-[#8a9a6e] uppercase">
                Infrastruktur
              </div>
              <div className="font-display text-[1.45rem] font-bold text-[#f2ede0]">Kesehatan Node</div>
            </div>
            <AudioWaveform size={18} className={adaWaspada ? 'text-amber' : 'text-[#8a9a6e]'} />
          </div>

          <div className="border-t border-white/8">
            {nodes.map((n, i) => (
              <div
                key={n.id}
                className={`flex items-center justify-between py-3.5 text-[0.88rem] ${i < nodes.length - 1 ? 'border-b border-white/6' : ''}`}
              >
                <div>
                  <span className="font-bold">{n.name}</span>
                  <div className="flex items-center gap-3 text-[0.72rem] text-[#7f8c72]">
                    <span>Suhu: {n.suhu?.toFixed(1) || '--'}°C</span>
                    <span>Gas: {n.gas || '--'} ppm</span>
                    <span className={n.flame ? 'text-danger font-bold' : 'text-ok'}>
                      🔥 {n.flame ? 'TRUE' : 'FALSE'}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 font-semibold text-[#cdd4c6]">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      n.status === 'on' ? 'bg-leaf' : n.status === 'warn' ? 'bg-amber' : 'bg-danger'
                    }`}
                  />
                  {n.status === 'off' ? 'Offline' : 'Online'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-white/8 pt-4">
            <div className="text-[0.68rem] text-[#7f8c72]">
              Data diperbarui otomatis setiap 3 detik
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
