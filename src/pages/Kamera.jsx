import { motion } from 'framer-motion';
import {
  Video, VideoOff, RadioTower, Unplug, Expand,
  AlertTriangle, Shield, RefreshCw, Camera, CameraOff, Monitor
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNodes } from '../hooks/useData';
import { stagger, fadeUp } from '../lib/motion';
import PageHeader from '../components/ui/PageHeader';
import { detectFromFile, detectFromUrl, isDanger, checkApiStatus } from '../services/yoloApi';

// ============================================================
// WEBCAM FEED — akses kamera laptop/external webcam via getUserMedia
// ============================================================
function WebcamFeed({ node, onResult, autoDetect = false, intervalMs = 5000 }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState(null);
  const [detecting, setDetecting] = useState(false);

  // Jalankan webcam
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
          setError('Kamera ditolak. Klik "Izinkan Kamera" untuk mengaktifkan.');
        } else if (err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan. Pastikan webcam terhubung.');
        } else {
          setError(`Gagal akses kamera: ${err.message}`);
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

  // Auto-detect dari video feed
  const runDetect = useCallback(async () => {
    if (!videoRef.current || !cameraOn || detecting) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    setDetecting(true);
    try {
      const result = await detectFromFile(video);
      if (onResult) onResult(result);
    } catch (e) {
      console.warn('YOLO detect error:', e);
    } finally {
      setDetecting(false);
    }
  }, [cameraOn, detecting, onResult]);

  useEffect(() => {
    if (!autoDetect || !cameraOn) return;
    runDetect();
    intervalRef.current = setInterval(runDetect, intervalMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoDetect, cameraOn, runDetect, intervalMs]);

  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#151b21] text-[#5a6570]">
        <CameraOff size={32} />
        <div className="text-center text-[0.78rem] font-semibold px-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#2a3540] px-4 py-2 text-xs font-bold text-white hover:bg-[#344050]"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  if (!cameraOn) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#151b21] text-[#5a6570]">
        <Camera size={28} className="animate-pulse" />
        <div className="font-mono text-[0.78rem]">Memulai kamera...</div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {/* Live indicator */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[0.72rem] font-bold text-white backdrop-blur-[6px]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
        LIVE
      </div>
      <div className="absolute top-3 right-3 z-10 rounded-full bg-black/55 px-3 py-1.5 font-mono text-[0.7rem] font-medium text-[#cfd8e0] backdrop-blur-[6px]">
        {cameraOn ? 'Webcam Aktif' : 'Kamera Off'}
      </div>

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* Detecting overlay */}
      {detecting && (
        <div className="absolute bottom-12 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[0.7rem] text-white">
          <RefreshCw size={10} className="animate-spin" />
          Mendeteksi...
        </div>
      )}
    </div>
  );
}

// ============================================================
// FEED VIEW — router: webcam > streamUrl > placeholder
// ============================================================
function FeedView({ node, large = false, useWebcam = false, onDetectionResult }) {
  const [webcamResult, setWebcamResult] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const lastDetectionRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // Deteksi dari stream URL
  const runUrlDetection = useCallback(async () => {
    if (!node.streamUrl || isDetecting) return;
    setIsDetecting(true);
    try {
      const result = await detectFromUrl(node.streamUrl);
      lastDetectionRef.current = result;
      if (onDetectionResult) onDetectionResult(result);
    } catch (e) {
      console.error('URL Detection error:', e);
    } finally {
      setIsDetecting(false);
    }
  }, [node.streamUrl, isDetecting, onDetectionResult]);

  useEffect(() => {
    if (!node.streamUrl) return;
    runUrlDetection();
    detectionIntervalRef.current = setInterval(runUrlDetection, 5000);
    return () => { if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current); };
  }, [node.streamUrl, runUrlDetection]);

  // Priority: webcam > streamUrl > offline/placeholder
  if (useWebcam) {
    const danger = webcamResult?.danger;
    const confidence = webcamResult?.confidence || 0;
    const label = webcamResult?.label || 'Aman';
    const fireProb = webcamResult?.probabilities?.fire || 0;
    const smokeProb = webcamResult?.probabilities?.smoke || 0;

    return (
      <div className="absolute inset-0 h-full w-full">
        <WebcamFeed
          node={node}
          autoDetect={true}
          intervalMs={5000}
          onResult={(r) => {
            setWebcamResult(r);
            if (onDetectionResult) onDetectionResult(r);
          }}
        />

        {/* Danger overlay */}
        {danger && (
          <motion.div
            className="absolute inset-0 border-[4px] border-danger bg-danger/10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Detection badge */}
        <div className={`absolute bottom-3 left-3 z-10 rounded-lg px-3 py-2 text-xs font-bold ${
          danger ? 'bg-danger text-white animate-pulse' : 'bg-ok/90 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {danger ? <AlertTriangle size={14} /> : <Shield size={14} />}
            <span>{label}</span>
          </div>
          <div className="mt-0.5 opacity-80">
            Api {Math.round(fireProb * 100)}% · Asap {Math.round(smokeProb * 100)}% · Conf {(confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    );
  }

  if (node.streamUrl) {
    const danger = lastDetectionRef.current?.danger;
    const confidence = lastDetectionRef.current?.confidence || 0;
    const label = lastDetectionRef.current?.label || 'Menunggu...';

    return (
      <div className="absolute inset-0 h-full w-full">
        <img src={node.streamUrl} alt={`Siaran ${node.name}`} className="h-full w-full object-cover" />

        {danger && (
          <motion.div
            className="absolute inset-0 border-[4px] border-danger bg-danger/10"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        <div className={`absolute top-4 left-4 rounded-lg px-3 py-2 text-xs font-bold ${
          danger ? 'bg-danger text-white animate-pulse' : 'bg-ok/90 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {danger ? <AlertTriangle size={14} /> : <Shield size={14} />}
            <span>{label}</span>
          </div>
          <div className="mt-0.5 opacity-80">Confidence: {(confidence * 100).toFixed(1)}%</div>
        </div>

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

  // Placeholder sambil tunggu stream
  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#243447,#0e1a26)]">
      <div className="absolute inset-0 opacity-40 [background:linear-gradient(rgba(255,255,255,0.06),transparent_12%)] [background-size:100%_5px]" />
      <div className="anim-scan absolute inset-x-0 top-0 h-10 bg-[linear-gradient(rgba(210,175,82,0.16),transparent)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#6b7d8c]">
        <RadioTower size={large ? 38 : 26} className="text-[#3a5064]" />
        <div className="font-mono text-[0.78rem] font-medium">{node.id} · menunggu stream gateway</div>
      </div>
      {large && (
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[0.74rem] font-bold text-white backdrop-blur-[6px]">
          <span className="anim-rec h-2 w-2 rounded-full bg-danger" />
          REC
        </div>
      )}
    </div>
  );
}

// ============================================================
// DETECTION STATS — panel statistik untuk feed utama
// ============================================================
function DetectionStats({ node, useWebcam = false }) {
  const [result, setResult] = useState(null);
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    checkApiStatus().then(s => setIsOnline(s.model_loaded)).catch(() => setIsOnline(false));
  }, []);

  const handleResult = useCallback((r) => setResult(r), []);
  const fireProb = result?.probabilities?.fire || 0;
  const smokeProb = result?.probabilities?.smoke || 0;
  const safeProb = result?.probabilities?.safe || 0;

  return (
    <>
      <FeedView node={node} large useWebcam={useWebcam} onDetectionResult={handleResult} />
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
            <div className={`font-mono font-semibold ${smokeProb > 0.5 ? 'text-amber' : 'text-ok'}`}>
              {(smokeProb * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[0.72rem] font-semibold text-sand">Aman</div>
            <div className="font-mono font-semibold text-ok">{(safeProb * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-[0.72rem] font-semibold text-sand">Model</div>
            <div className="flex items-center gap-1 font-mono font-semibold text-ink">
              YOLOv8
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-ok' : 'bg-danger'}`} />
            </div>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-[0.85rem] font-bold text-white transition-transform hover:-translate-y-0.5">
          <Expand size={15} />
          Layar Penuh
        </button>
      </div>
    </>
  );
}

// ============================================================
// KAMERA UTAMA — halaman penuh
// ============================================================
export default function Kamera() {
  const nodes = useNodes();
  const [utama, ...lainnya] = nodes;
  const [useWebcam, setUseWebcam] = useState(true); // default: pakai webcam
  const [cameras, setCameras] = useState([]);
  const [selectedCam, setSelectedCam] = useState('');

  // Enumumerate available cameras
  useEffect(() => {
    async function listCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCam) {
          setSelectedCam(videoDevices[0].deviceId);
        }
      } catch (e) {
        console.warn('enumerateDevices error:', e);
      }
    }
    listCameras();
  }, []);

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

      {/* Kontrol sumber kamera */}
      <motion.div variants={fadeUp} className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setUseWebcam(true)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition-all ${
              useWebcam
                ? 'bg-ink text-white'
                : 'border border-line bg-paper text-moss hover:border-sand'
            }`}
          >
            <Camera size={15} />
            Webcam
          </button>
          <button
            onClick={() => setUseWebcam(false)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.82rem] font-bold transition-all ${
              !useWebcam
                ? 'bg-ink text-white'
                : 'border border-line bg-paper text-moss hover:border-sand'
            }`}
          >
            <Monitor size={15} />
            Stream URL
          </button>
        </div>

        {useWebcam && cameras.length > 1 && (
          <select
            value={selectedCam}
            onChange={e => setSelectedCam(e.target.value)}
            className="rounded-xl border border-line bg-paper px-4 py-2.5 text-[0.82rem] font-medium text-ink focus:border-forest"
          >
            {cameras.map((cam, i) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Kamera ${i + 1}`}
              </option>
            ))}
          </select>
        )}

        {useWebcam && cameras.length > 0 && (
          <div className="text-[0.75rem] text-sand">
            {cameras.length} kamera terdeteksi
          </div>
        )}
      </motion.div>

      {utama ? (
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
              <DetectionStats node={utama} useWebcam={useWebcam} />
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
                <span className={`inline-flex items-center gap-1.5 text-[0.74rem] font-bold ${n.status === 'off' ? 'text-danger' : 'text-ok'}`}>
                  <span className={`h-[7px] w-[7px] rounded-full ${n.status === 'off' ? 'bg-danger' : 'bg-ok'}`} />
                  {n.status === 'off' ? 'Offline' : 'Online'}
                </span>
              </div>
              <div className="relative aspect-video overflow-hidden">
                <FeedView node={n} useWebcam={false} />
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-[20px] border border-line bg-paper py-20">
          <RadioTower size={48} className="mb-4 text-[#3a5064]" />
          <h3 className="mb-2 text-lg font-bold text-ink">Belum Ada Data Kamera</h3>
          <p className="text-sm text-sand">Pastikan sensor node dengan stream URL sudah aktif</p>
        </motion.div>
      )}
    </motion.div>
  );
}
