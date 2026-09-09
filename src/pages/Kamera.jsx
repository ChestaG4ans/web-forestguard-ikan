import { motion } from 'framer-motion';
import {
  Video, VideoOff, RadioTower, Unplug, Expand,
  AlertTriangle, Shield, RefreshCw, Camera, CameraOff, Monitor, Wifi, WifiOff
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNodes } from '../hooks/useData';
import { stagger, fadeUp } from '../lib/motion';
import PageHeader from '../components/ui/PageHeader';
import { detectFromFile, checkApiStatus } from '../services/yoloApi';

const YOLO_API_URL = 'http://localhost:8000';

// ============================================================
// WEBCAM FEED COMPONENT
// ============================================================
function WebcamFeed({ onResult, intervalMs = 3000 }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);

  // Start camera
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraOn(true);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        if (err.name === 'NotAllowedError') {
          setError('Kamera ditolak. Izinkan akses kamera di browser.');
        } else if (err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan. Pastikan webcam terhubung.');
        } else {
          setError(`Error: ${err.message}`);
        }
        setCameraOn(false);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Capture frame and detect
  const runDetection = useCallback(async () => {
    if (!videoRef.current || !cameraOn || detecting) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    setDetecting(true);
    try {
      const res = await detectFromFile(video);
      setResult(res);
      if (onResult) onResult(res);
    } catch (e) {
      console.warn('YOLO detection error:', e);
    } finally {
      setDetecting(false);
    }
  }, [cameraOn, detecting, onResult]);

  // Auto detect every interval
  useEffect(() => {
    if (!cameraOn) return;
    runDetection();
    intervalRef.current = setInterval(runDetection, intervalMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [cameraOn, runDetection, intervalMs]);

  // Loading state
  if (!cameraOn && !error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0e1a26]">
        <Camera size={48} className="animate-pulse text-[#3a5064]" />
        <div className="text-center">
          <div className="font-mono text-[0.9rem] text-[#6b7d8c]">Meminta akses kamera...</div>
          <div className="mt-1 text-[0.75rem] text-[#4a5a6a]">Izinkan di browser untuk melanjutkan</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0e1a26]">
        <CameraOff size={48} className="text-danger" />
        <div className="text-center">
          <div className="font-bold text-danger">Kamera Tidak Aktif</div>
          <div className="mt-2 max-w-[300px] text-[0.85rem] text-[#6b7d8c]">{error}</div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-[#2a3540] px-6 py-3 text-[0.85rem] font-bold text-white hover:bg-[#344050]"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const danger = result?.danger;
  const fireProb = result?.probabilities?.fire || 0;
  const smokeProb = result?.probabilities?.smoke || 0;
  const safeProb = result?.probabilities?.safe || 0;
  const label = result?.label || 'Mendeteksi...';

  return (
    <div className="absolute inset-0">
      {/* LIVE indicator */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[0.75rem] font-bold text-white backdrop-blur-sm">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" />
        LIVE
      </div>

      {/* YOLO Status */}
      <div className={`absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.75rem] font-bold backdrop-blur-sm ${
        detecting ? 'bg-amber/80 text-white' : 'bg-black/60 text-white'
      }`}>
        {detecting ? (
          <>
            <RefreshCw size={12} className="animate-spin" />
            Mendeteksi...
          </>
        ) : (
          <>
            <Shield size={12} />
            YOLO Ready
          </>
        )}
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* Danger overlay */}
      {danger && (
        <motion.div
          className="absolute inset-0 border-[6px] border-danger"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Detection results */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className={`rounded-xl px-4 py-3 text-white backdrop-blur-sm ${
          danger ? 'bg-danger/90 animate-pulse' : 'bg-ok/90'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {danger ? <AlertTriangle size={16} /> : <Shield size={16} />}
            <span>{label}</span>
          </div>
          <div className="mt-1 flex gap-4 text-[0.8rem]">
            <span>🔥 Api: {Math.round(fireProb * 100)}%</span>
            <span>💨 Asap: {Math.round(smokeProb * 100)}%</span>
            <span>✅ Aman: {Math.round(safeProb * 100)}%</span>
          </div>
        </div>
      </div>

      {/* No YOLO warning */}
      {!result && !detecting && (
        <div className="absolute bottom-4 right-4 z-20 rounded-lg bg-amber/90 px-3 py-2 text-[0.75rem] font-bold text-white backdrop-blur-sm">
          ⚠️ YOLO backend belum aktif
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN KAMERA PAGE
// ============================================================
export default function Kamera() {
  const nodes = useNodes();
  const [selectedNodeId, setSelectedNodeId] = useState('N2'); // Default: N2
  const [yoloStatus, setYoloStatus] = useState(null);
  const [cameraCount, setCameraCount] = useState(0);

  // Get selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const otherNodes = nodes.filter(n => n.id !== selectedNodeId);

  // Check YOLO status
  useEffect(() => {
    checkApiStatus()
      .then(s => setYoloStatus(s))
      .catch(() => setYoloStatus({ model_loaded: false }));
  }, []);

  // Count cameras
  useEffect(() => {
    async function countCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameraCount(videoDevices.length);
      } catch (e) {
        setCameraCount(0);
      }
    }
    countCameras();
  }, []);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        eyebrow="Pemantauan Visual"
        title="Pemantauan Kamera"
        description="Deteksi api/asap menggunakan YOLOv8 · Node 02 (Aktif)"
      >
        {/* YOLO Status Badge */}
        <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-[0.8rem] font-bold ${
          yoloStatus?.model_loaded
            ? 'border border-ok bg-ok/10 text-ok'
            : 'border border-amber bg-amber/10 text-amber'
        }`}>
          {yoloStatus?.model_loaded ? (
            <>
              <Wifi size={14} />
              YOLO Aktif
            </>
          ) : (
            <>
              <WifiOff size={14} />
              YOLO Offline
            </>
          )}
        </div>
      </PageHeader>

      {/* Node Selector */}
      <motion.div variants={fadeUp} className="mb-5 flex flex-wrap items-center gap-4">
        <div className="text-[0.82rem] font-bold text-moss">Pilih Node:</div>
        <div className="flex gap-2">
          {['N1', 'N2'].map(id => (
            <button
              key={id}
              onClick={() => setSelectedNodeId(id)}
              className={`rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition-all ${
                selectedNodeId === id
                  ? 'bg-ink text-white'
                  : 'border border-line bg-paper text-moss hover:border-sand'
              }`}
            >
              Node {id}
            </button>
          ))}
        </div>

        {cameraCount > 0 && (
          <div className="flex items-center gap-2 text-[0.75rem] text-sand">
            <Camera size={12} />
            {cameraCount} webcam terdeteksi
          </div>
        )}

        <a
          href={YOLO_API_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-2.5 text-[0.75rem] font-bold text-moss hover:border-sand"
        >
          <RefreshCw size={12} />
          Cek YOLO ({YOLO_API_URL})
        </a>
      </motion.div>

      {/* Main Video Feed */}
      {selectedNode && (
        <motion.div variants={fadeUp} className="space-y-5">
          {/* Primary Feed */}
          <div className="overflow-hidden rounded-[20px] border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
                  <Video size={18} className="text-gold" />
                </div>
                <div>
                  <div className="font-bold text-ink">{selectedNode.name}</div>
                  <div className="text-[0.72rem] text-sand">
                    Suhu: {selectedNode.suhu?.toFixed(1) || '--'}°C · Gas: {selectedNode.gas || '--'} ppm
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.75rem] font-bold ${
                  selectedNode.flame ? 'bg-danger text-white animate-pulse' : 'bg-ok/20 text-ok'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${selectedNode.flame ? 'bg-white' : 'bg-ok'}`} />
                  {selectedNode.flame ? 'API TERDETEKSI!' : 'Aman'}
                </span>
              </div>
            </div>

            {/* Webcam Feed */}
            <div className="relative aspect-video overflow-hidden bg-[#0e1a26]">
              <WebcamFeed intervalMs={3000} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
              <div className="text-[0.75rem] text-sand">
                Deteksi otomatis setiap 3 detik via YOLOv8
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-[0.82rem] font-bold text-white hover:brightness-110">
                <Expand size={14} />
                Layar Penuh
              </button>
            </div>
          </div>

          {/* Other Nodes */}
          {otherNodes.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherNodes.map(n => (
                <div key={n.id} className="overflow-hidden rounded-[16px] border border-line bg-paper">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Video size={14} className="text-gold" />
                      <span className="font-bold text-ink">{n.name}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${
                      n.flame ? 'bg-danger/20 text-danger' : 'bg-ok/20 text-ok'
                    }`}>
                      {n.flame ? '⚠️' : '✓'} {n.flame ? 'Api!' : 'Aman'}
                    </span>
                  </div>
                  <div className="relative aspect-video bg-[#0e1a26]">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#4a5a6a]">
                      <Video size={24} />
                      <div className="text-[0.7rem]">Feed tidak tersedia</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 text-[0.7rem] text-sand">
                    Suhu: {n.suhu?.toFixed(1) || '--'}°C · Gas: {n.gas || '--'} ppm
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedNode && (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-[20px] border border-line bg-paper py-20">
          <RadioTower size={56} className="mb-4 text-[#3a5064]" />
          <h3 className="text-xl font-bold text-ink">Tidak Ada Node</h3>
          <p className="mt-2 text-sand">Pastikan Firebase RTDB memiliki data forest_data/N1 atau N2</p>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div variants={fadeUp} className="mt-6 rounded-2xl border border-line bg-mist p-6">
        <h3 className="mb-3 font-bold text-ink">📋 Cara Testing Kamera</h3>
        <ol className="space-y-2 text-[0.85rem] text-moss">
          <li><strong>1.</strong> Pastikan backend YOLO berjalan di terminal:</li>
          <li className="ml-4 rounded bg-cream px-3 py-2 font-mono text-[0.8rem]">
            cd backend && python main.py
          </li>
          <li><strong>2.</strong> Buka browser ke <span className="font-mono">{YOLO_API_URL}</span> untuk cek YOLO status</li>
          <li><strong>3.</strong> Klik "Izinkan" saat browser minta akses kamera</li>
          <li><strong>4.</strong> YOLO akan otomatis mendeteksi api/asap dari feed webcam setiap 3 detik</li>
        </ol>
      </motion.div>
    </motion.div>
  );
}
