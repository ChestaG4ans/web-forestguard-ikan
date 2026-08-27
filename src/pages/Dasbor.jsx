import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, AudioWaveform } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { useTelemetry, useNodes } from '../hooks/useData';
import { stagger, fadeUp } from '../lib/motion';
import StatusPill from '../components/ui/StatusPill';

const fmt1 = (v) => v.toFixed(1).replace('.', ',');
const sign = (v, d = 1) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(d).replace('.', ',')}`;
const jam = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const LINE = { suhu: '#b8862f', kelembapan: '#2f7048', gas: '#c99a3e' };

const BASE = { suhu: 30.9, kelembapan: 73.1, gas: 59 };

const SENSORS = [
  {
    key: 'suhu', label: 'Suhu udara', id: 'DHT22-01', unit: '°C', icon: Thermometer,
    range: '24—34 °C', warnIf: (v) => v > 36,
    val: (v) => fmt1(v), delta: (v) => sign(v - BASE.suhu), fill: (v) => ((v - 20) / 20) * 100,
  },
  {
    key: 'kelembapan', label: 'Kelembapan', id: 'DHT22-01', unit: '%', icon: Droplets,
    range: '55—80 %', warnIf: (v) => v < 50,
    val: (v) => Math.round(v), delta: (v) => sign(v - BASE.kelembapan), fill: (v) => ((v - 30) / 70) * 100,
  },
  {
    key: 'gas', label: 'Kadar gas', id: 'MQ135-01', unit: 'ppm', icon: Wind,
    range: '0—100 ppm', warnIf: (v) => v > 90,
    val: (v) => Math.round(v), delta: (v) => sign(v - BASE.gas, 0), fill: (v) => (v / 150) * 100,
  },
];

const METRIC_LABEL = { suhu: 'Suhu', kelembapan: 'Kelembapan', gas: 'Gas' };

function ChartTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const unit = metric === 'suhu' ? '°C' : metric === 'kelembapan' ? '%' : 'ppm';
  return (
    <div className="rounded-[9px] bg-pine px-3.5 py-2.5 text-cream shadow-lg">
      <div className="font-mono text-[0.72rem] text-[#9aa892]">{label}</div>
      <div className="mt-0.5 font-mono text-[0.9rem] font-semibold">
        {typeof payload[0].value === 'number' ? String(payload[0].value).replace('.', ',') : payload[0].value} {unit}
      </div>
    </div>
  );
}

export default function Dasbor() {
  const telemetry = useTelemetry('node_1');
  const nodes = useNodes();
  const [metric, setMetric] = useState('kelembapan');
  const [range, setRange] = useState('1J');
  const [series, setSeries] = useState([]);
  const score = 98;

  const bufRef = useRef([]);
  useEffect(() => {
    if (!telemetry) return;
    bufRef.current = [
      ...bufRef.current,
      {
        t: jam(telemetry.waktu),
        suhu: +telemetry.suhu.toFixed(1),
        kelembapan: Math.round(telemetry.kelembapan),
        gas: Math.round(telemetry.gas),
      },
    ].slice(-12);
    setSeries(bufRef.current);
  }, [telemetry]);

  // Fallback: tampilkan skeleton loading + mock data
  if (!telemetry) {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <div className="h-32 w-1/2 animate-pulse rounded-2xl bg-[#f0ebe0]" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-[#f0ebe0]" />
          ))}
        </div>
      </motion.div>
    );
  }
  const { suhu, kelembapan, gas, waktu } = telemetry;
  const values = { suhu, kelembapan, gas };
  const adaWaspada = SENSORS.some((s) => s.warnIf(values[s.key]));
  const bigVal =
    metric === 'suhu' ? `${fmt1(suhu)}°` : metric === 'kelembapan' ? `${Math.round(kelembapan)}%` : `${Math.round(gas)} ppm`;
  const bigStatus = SENSORS.find((s) => s.key === metric).warnIf(values[metric]) ? 'Waspada' : 'Normal';

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* hero halaman */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-7">
        <div className="max-w-[560px]">
          <div className="mb-3 text-[0.68rem] font-bold tracking-[0.18em] text-canopy uppercase">
            Pemantauan Realtime · Node 01
          </div>
          <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-none font-bold tracking-tight text-ink">
            Kawasan Inti <span className="text-forest">IKN</span>
          </h1>
          <p className="mt-4 leading-relaxed text-moss [text-wrap:pretty]">
            Sistem membaca kondisi mikroklimat dan kualitas udara dari koridor hijau pusat pemerintahan.
          </p>
        </div>
        <div className="flex items-center gap-4 pt-1.5">
          <div className="h-[46px] w-0.5 bg-[#c9c0ad]" />
          <div>
            <div className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.16em] text-forest uppercase">
              <span className={`h-2 w-2 rounded-full ${adaWaspada ? 'bg-amber' : 'bg-forest'}`} />
              {adaWaspada ? 'Perlu Perhatian' : 'Kondisi Aman'}
            </div>
            <div className="mt-1.5 text-[0.82rem] text-sage">
              Diperbarui <span className="font-mono">{jam(waktu)}</span> WITA
            </div>
          </div>
        </div>
      </motion.div>

      {/* telemetri langsung */}
      <motion.section variants={fadeUp} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2 pb-4">
          <div>
            <div className="mb-1.5 text-[0.68rem] font-bold tracking-[0.18em] text-canopy uppercase">Telemetri Langsung</div>
            <div className="font-display text-[1.45rem] font-bold text-ink">Pembacaan sensor</div>
          </div>
          <div className="text-[0.82rem] text-sand">Ambang batas terkalibrasi · 22 Jul 2026</div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {SENSORS.map((s) => {
            const v = values[s.key];
            const warn = s.warnIf(v);
            const Icon = s.icon;
            return (
              <div key={s.key} className="min-w-0 bg-paper p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line-2 bg-[#f4f0e7] text-[#4a5a4e]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-[0.98rem] font-bold">{s.label}</div>
                      <div className="font-mono text-[0.72rem] text-sand">{s.id}</div>
                    </div>
                  </div>
                  <StatusPill tone={warn ? 'warn' : 'ok'}>{warn ? 'Waspada' : 'Aman'}</StatusPill>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div className="flex items-end gap-1.5">
                    <span className="font-mono text-[clamp(2.2rem,3.2vw,2.9rem)] leading-[0.85] font-medium text-ink">
                      {s.val(v)}
                    </span>
                    <span className="mb-1 text-[0.92rem] text-sage">{s.unit}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[0.84rem] font-semibold text-forest">{s.delta(v)}</div>
                    <div className="text-[0.72rem] text-sand">sejak 1 jam</div>
                  </div>
                </div>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-line-2">
                  <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out ${warn ? 'bg-warn' : 'bg-forest'}`}
                    style={{ width: `${Math.min(100, Math.max(0, s.fill(v)))}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[0.72rem] text-sand">
                  <span>Rentang aman</span>
                  <span className="font-mono">{s.range}</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* grafik + kesehatan node */}
      <motion.section
        variants={fadeUp}
        className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] gap-5"
      >
        {/* kartu grafik */}
        <div className="min-w-0 rounded-2xl border border-line bg-paper p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1.5 text-[0.68rem] font-bold tracking-[0.18em] text-canopy uppercase">Analisis Rentang</div>
              <div className="font-display text-[1.45rem] font-bold text-ink">Tren kawasan</div>
              <div className="mt-1 text-[0.82rem] text-sand">Sampel setiap 2,5 detik · Node 01</div>
            </div>
            <div className="flex gap-0.5 rounded-xl border border-line-2 bg-cream p-1">
              {['1J', '6J', '24J'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-[9px] px-3.5 py-1.5 font-mono text-[0.76rem] font-semibold transition-colors ${
                    range === r ? 'bg-pine text-cream' : 'text-sage hover:text-ink'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            {Object.entries(METRIC_LABEL).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`rounded-full border px-4 py-2 text-[0.83rem] font-semibold transition-colors ${
                  metric === k
                    ? 'border-[#a9c3ac] bg-[#e4eee1] text-forest'
                    : 'border-line-2 bg-paper text-moss hover:border-[#a9c3ac] hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[1.7rem] font-medium text-ink">{bigVal}</span>
              <span className="text-[0.9rem] font-semibold text-moss">{bigStatus}</span>
            </div>
            <div className="hidden font-mono text-[0.7rem] font-medium tracking-[0.12em] text-sand uppercase sm:block">
              Pembaruan {jam(waktu)}
            </div>
          </div>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid vertical={false} stroke="#ece5d6" />
                <XAxis
                  dataKey="t"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={48}
                  tick={{ fill: '#a89f8b', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip metric={metric} />} cursor={{ stroke: '#c9c0ad', strokeDasharray: '3 4' }} />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={LINE[metric]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* kartu kesehatan node — panel gelap */}
        <div className="flex min-w-0 flex-col rounded-2xl bg-pine p-6 text-[#e8ece2] md:p-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1.5 text-[0.68rem] font-bold tracking-[0.18em] text-[#8a9a6e] uppercase">Infrastruktur</div>
              <div className="font-display text-[1.45rem] font-bold text-[#f2ede0]">Kesehatan node</div>
            </div>
            <AudioWaveform size={18} className="text-amber" />
          </div>
          <div className="flex justify-center py-6">
            <div className="relative h-[172px] w-[172px]">
              <svg viewBox="0 0 172 172" className="h-full w-full -rotate-90">
                <circle cx="86" cy="86" r="80" fill="none" stroke="#31473a" strokeWidth="1.5" />
                <motion.circle
                  cx="86" cy="86" r="80" fill="none" stroke="#c99a3e" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 80}
                  initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - score / 100) }}
                  transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1], delay: 0.4 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[3.1rem] leading-[0.8] font-medium text-[#f2ede0]">{score}</span>
                <span className="mt-2 text-[0.62rem] font-bold tracking-[0.16em] text-[#7f8c72] uppercase">Skor Sistem</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8">
            {nodes.map((n, i) => (
              <div
                key={n.id}
                className={`flex items-center justify-between py-3.5 text-[0.88rem] ${i < nodes.length - 1 ? 'border-b border-white/6' : ''}`}
              >
                <span>{n.name.replace(' — ', ' · ')}</span>
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
          <div className="mt-auto flex gap-10 border-t border-white/8 pt-5">
            <div>
              <div className="mb-1 text-[0.72rem] text-[#7f8c72]">Latensi</div>
              <div className="font-mono text-[1.2rem] text-[#f2ede0]">42 ms</div>
            </div>
            <div>
              <div className="mb-1 text-[0.72rem] text-[#7f8c72]">Paket data</div>
              <div className="font-mono text-[1.2rem] text-[#f2ede0]">99,8%</div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
