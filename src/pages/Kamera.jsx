import { motion } from 'framer-motion';
import { Video, VideoOff, RadioTower, Unplug, Expand, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNodes } from '../hooks/useData';
import { stagger, fadeUp } from '../lib/motion';
import PageHeader from '../components/ui/PageHeader';
import { detectFromFile, detectFromUrl, isDanger, checkApiStatus } from '../services/yoloApi';

// streamUrl terisi → tampilkan video; null → placeholder sinyal.
function FeedView({ node, large = false, onDetectionResult }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const lastDetectionRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Fungsi deteksi YOLO
  const runDetection = useCallback(async () => {
    if (!node.streamUrl || isDetecting) return;

    setIsDetecting(true);
    try {
      const result = await detectFromUrl(node.streamUrl);
      lastDetectionRef.current = result;
      if (onDetectionResult) {
        onDetectionResult(result);
      }
    } catch (error) {
      console.error('YOLO Detection error:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [node.streamUrl, isDetecting, onDetectionResult]);

  // Auto-detect setiap 5 detik jika ada stream URL
  useEffect(() => {
    if (node.streamUrl) {
      // Initial detection
      runDetection();

      // Auto-detect interval
      detectionIntervalRef.current = setInterval(runDetection, 5000);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [node.streamUrl, runDetection]);

  // Status danger detection
  const danger = lastDetectionRef.current?.danger;
  const confidence = lastDetectionRef.current?.confidence || 0;
  const detectedClass = lastDetectionRef.current?.class || 'safe';
  const label = lastDetectionRef.current?.label || 'Menunggu deteksi...';

  if (node.streamUrl) {
    return (
      <div className="absolute inset-0 h-full w-full">
        <img src={node.streamUrl} alt={`Siaran ${node.name}`} className="h-full w-full object-cover" />

        {/* YOLO Detection Overlay */}
        {danger && (
          <motion.div
            className="absolute inset-0 border-[4px] border-danger bg-danger/10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Detection Badge */}
        <div className={`absolute top-4 left-4 rounded-lg px-3 py-2 text-xs font-bold ${
          danger ? 'bg-danger text-white animate-pulse' : 'bg-ok/90 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {danger ? <AlertTriangle size={14} /> : <Shield size={14} />}
            <span>{label}</span>
          </div>
          <div className="mt-0.5 opacity-80">
            Confidence: {(confidence * 100).toFixed(1)}%
          </div>
        </div>

        {/* Loading Indicator */}
        {isDetecting && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
            <RefreshCw size={12} className="animate-spin" />
            Mendeteksi...
          </div>
        )}
      </div>
    );
  }

  if (node.status === 'off') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#151b21] text-[#5a6570]">
        <Unplug size={large ? 34 : 26} />
        <div className="text-[0.72rem] font-semibold">Sinyal Terputus</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#243447,#0e1a26)]">
      {/* garis pindai + scanline CRT */}
      <div className="absolute inset-0 opacity-40 [background:linear-gradient(rgba(255,255,255,0.06),transparent_12%)] [background-size:100%_5px]" />
      <div className="anim-scan absolute inset-x-0 top-0 h-10 bg-[linear-gradient(rgba(210,175,82,0.16),transparent)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#6b7d8c]">
        <RadioTower size={large ? 38 : 26} className="text-[#3a5064]" />
        <div className="font-mono text-[0.78rem] font-medium">{node.id} · menunggu stream gateway</div>
      </div>
    </div>
  );
}

// Komponen deteksi stats untuk feed utama
function DetectionStats({ node }) {
  const [result, setResult] = useState(null);
  const [isOnline, setIsOnline] = useState(null);

  // Cek status API
  useEffect(() => {
    checkApiStatus().then(status => {
      setIsOnline(status.model_loaded);
    }).catch(() => setIsOnline(false));
  }, []);

  const handleDetectionResult = useCallback((detectionResult) => {
    setResult(detectionResult);
  }, []);

  const fireProb = result?.probabilities?.fire || 0;
  const smokeProb = result?.probabilities?.smoke || 0;
  const safeProb = result?.probabilities?.safe || 0;

  return (
    <>
      <FeedView node={node} large onDetectionResult={handleDetectionResult} />
      <div className="flex flex-wrap items-center justify-between gap-3.5 px-5 py-3.5">
        <div className="flex gap-6">
          <div>
            <div className="text-[0.72rem] font-semibold text-sand">Deteksi Api</div>
            <div className={`font-mono font-semibold ${fireProb > 0.5 ? 'text-danger' : 'text-ok'}`}>
              {(fireProb * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[0.72rem] font-semibold text-sand">Deteksi Asap</div>
            <div className={`font-mono font-semibold ${smokeProb > 0.5 ? 'text-warning' : 'text-ok'}`}>
              {(smokeProb * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[0.72rem] font-semibold text-sand">Aman</div>
            <div className="font-mono font-semibold text-ok">{(safeProb * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[0.72rem] font-semibold text-sand">Model</div>
            <div className="font-mono font-semibold text-ink flex items-center gap-1">
              YOLOv8
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-ok' : 'bg-danger'}`} />
            </div>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-ink px-4.5 py-2.5 text-[0.85rem] font-bold text-white transition-transform hover:-translate-y-0.5">
          <Expand size={15} />
          Layar Penuh
        </button>
      </div>
    </>
  );
}

export default function Kamera() {
  const nodes = useNodes();
  const [utama, ...lainnya] = nodes;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        eyebrow="Pemantauan Visual"
        title="Pemantauan Kamera"
        description="Streaming langsung & deteksi visi komputer · Kawasan Inti IKN"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-[#f2c9c2] bg-[#fbeae7] px-5 py-2.5 text-[0.9rem] font-bold text-danger">
          <span className="anim-rec h-[9px] w-[9px] rounded-full bg-danger" />
          SIARAN LANGSUNG
        </div>
      </PageHeader>

      {utama && (
        <motion.div variants={fadeUp} className="grid auto-rows-min grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
          {/* feed utama */}
          <div className="overflow-hidden rounded-[20px] border border-line bg-paper xl:row-span-2">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5 font-bold text-ink">
                <Video size={17} className="text-gold" />
                {utama.name}
              </div>
              <span className="inline-flex items-center gap-2 text-[0.8rem] font-bold text-ok">
                <span className="h-2 w-2 rounded-full bg-ok" />
                Online
              </span>
            </div>
            <div className="relative aspect-video overflow-hidden">
              <DetectionStats node={utama} />
            </div>
          </div>

          {/* feed kecil */}
          {lainnya.map((n) => (
            <div key={n.id} className="overflow-hidden rounded-[20px] border border-line bg-paper">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div className="flex items-center gap-2 text-[0.9rem] font-bold text-ink">
                  {n.status === 'off' ? <VideoOff size={16} className="text-danger" /> : <Video size={16} className="text-gold" />}
                  {n.name}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[0.74rem] font-bold ${n.status === 'off' ? 'text-danger' : 'text-ok'}`}
                >
                  <span className={`h-[7px] w-[7px] rounded-full ${n.status === 'off' ? 'bg-danger' : 'bg-ok'}`} />
                  {n.status === 'off' ? 'Offline' : 'Online'}
                </span>
              </div>
              <div className="relative aspect-video overflow-hidden">
                <FeedView node={n} />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!utama && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-[20px] border border-line bg-paper py-20">
          <RadioTower size={48} className="text-[#3a5064] mb-4" />
          <h3 className="text-lg font-bold text-ink mb-2">Belum Ada Data Kamera</h3>
          <p className="text-sm text-sand">Pastikan sensor node dengan stream URL sudah aktif</p>
        </motion.div>
      )}
    </motion.div>
  );
}
