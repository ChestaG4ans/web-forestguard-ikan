import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Bell, Info, Save, Check } from 'lucide-react';
import { getThresholds, saveThresholds } from '../services/dataProvider';
import { stagger, fadeUp } from '../lib/motion';
import PageHeader from '../components/ui/PageHeader';

const FIELDS = [
  { key: 'suhuMax', label: 'Batas Suhu Bahaya (°C)', help: 'Notifikasi aktif bila suhu melebihi nilai ini.' },
  { key: 'gasMax', label: 'Batas Gas Bahaya (PPM)', help: 'Notifikasi aktif bila kadar gas melebihi nilai ini.' },
  { key: 'kelembapanMin', label: 'Batas Kelembapan Minimum (%)', help: 'Kelembapan di bawah nilai ini meningkatkan risiko kebakaran.' },
];

const PREFS = [
  { key: 'browser', label: 'Notifikasi Browser', desc: 'Tampilkan peringatan langsung di peramban.' },
  { key: 'sound', label: 'Alarm Bunyi', desc: 'Bunyikan sirene saat status bahaya terdeteksi.' },
  { key: 'power', label: 'Mode Hemat Energi', desc: 'Kurangi frekuensi pembacaan pada malam hari.' },
];

const INFO = [
  ['Versi Firmware', 'v2.1.4'],
  ['Status Koneksi', 'Terhubung'],
  ['Model Deteksi', 'YOLOv8'],
  ['Node Terhubung', '2 / 3'],
  ['Instansi', 'Universitas Gunadarma'],
];

function CardHeader({ icon: Icon, iconBg, iconColor, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-[11px]" style={{ background: iconBg, color: iconColor }}>
        <Icon size={18} />
      </div>
      <h3 className="text-[1.02rem] font-bold text-ink">{title}</h3>
    </div>
  );
}

function Toggle({ on, onClick, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-[30px] w-[54px] shrink-0 rounded-full transition-colors duration-250 ${on ? 'bg-ok' : 'bg-[#dcdbd2]'}`}
    >
      <motion.span
        className="absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.25)]"
        animate={{ left: on ? 27 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

export default function Pengaturan() {
  const [values, setValues] = useState(getThresholds);
  const [prefs, setPrefs] = useState({ browser: true, sound: false, power: false });
  const [saving, setSaving] = useState('idle'); // idle | saving | saved

  const simpan = async () => {
    setSaving('saving');
    await saveThresholds(values);
    setSaving('saved');
    setTimeout(() => setSaving('idle'), 2000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        eyebrow="Konfigurasi"
        title="Pengaturan Sistem"
        description="Ambang batas sensor dan preferensi pemantauan"
      />

      <motion.div variants={fadeUp} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-6">
        {/* ambang batas */}
        <div className="overflow-hidden rounded-[20px] border border-line bg-paper">
          <CardHeader icon={SlidersHorizontal} iconBg="#f7edd2" iconColor="#b8862f" title="Ambang Batas Sensor" />
          <div className="p-6">
            {FIELDS.map((f) => (
              <div key={f.key} className="mb-5">
                <label htmlFor={f.key} className="mb-2 block text-[0.9rem] font-semibold text-[#5f6b5e]">
                  {f.label}
                </label>
                <input
                  id={f.key}
                  type="number"
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-line-2 bg-cream px-4 py-3 font-mono text-[1rem] font-medium text-ink focus:border-forest"
                />
                <span className="mt-2 block text-[0.78rem] text-sand">{f.help}</span>
              </div>
            ))}
            <button
              onClick={simpan}
              disabled={saving === 'saving'}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-forest py-3.5 text-[0.95rem] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {saving === 'saved' ? <Check size={17} /> : <Save size={17} />}
              {saving === 'saving' ? 'Menyimpan…' : saving === 'saved' ? 'Pengaturan Tersimpan' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>

        {/* preferensi notifikasi */}
        <div className="overflow-hidden rounded-[20px] border border-line bg-paper">
          <CardHeader icon={Bell} iconBg="#e6f1e8" iconColor="#2f7048" title="Preferensi Notifikasi" />
          <div className="px-6 py-3">
            {PREFS.map((p, i) => (
              <div
                key={p.key}
                className={`flex items-center justify-between py-[17px] ${i < PREFS.length - 1 ? 'border-b border-line' : ''}`}
              >
                <div>
                  <div className="text-[0.95rem] font-semibold text-ink">{p.label}</div>
                  <div className="mt-0.5 text-[0.78rem] text-sand">{p.desc}</div>
                </div>
                <Toggle on={prefs[p.key]} label={p.label} onClick={() => setPrefs((s) => ({ ...s, [p.key]: !s[p.key] }))} />
              </div>
            ))}
          </div>
        </div>

        {/* informasi sistem */}
        <div className="overflow-hidden rounded-[20px] border border-line bg-paper">
          <CardHeader icon={Info} iconBg="#eaeef3" iconColor="#1e2a20" title="Informasi Sistem" />
          <div className="px-6 py-3">
            {INFO.map(([label, value], i) => (
              <div
                key={label}
                className={`flex items-center justify-between py-4 ${i < INFO.length - 1 ? 'border-b border-line' : ''}`}
              >
                <span className="text-[0.92rem] text-sage">{label}</span>
                {label === 'Status Koneksi' ? (
                  <strong className="inline-flex items-center gap-2 font-bold text-ok">
                    <span className="h-2 w-2 rounded-full bg-ok" />
                    {value}
                  </strong>
                ) : (
                  <strong className="font-mono font-semibold text-ink">{value}</strong>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
