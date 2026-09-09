/*
 * Lapisan data aplikasi. Semua halaman membaca data lewat fungsi di sini.
 * Menggunakan Firebase Realtime Database sebagai backend (ForestGuard / FireForest PKM 2026).
 *
 * Skema Realtime Database:
 *   /sensor_nodes/{nodeId}  { name, area, lat, lng, status, suhu, kelembapan, gas, lastSeen, streamUrl }
 *   /alerts_history/{alertId} { cat, title, msg, read, createdAt }
 *   /config/thresholds        { suhuMax, gasMax, kelembapanMin }
 */

import { db } from './firebase';
import { ref, onValue, set, update } from 'firebase/database';

// ============================================================
// DATA MOCK — fallback saat Realtime DB belum ada data
// ============================================================

const MOCK_TELEMETRY = {
  suhu: 31.3,
  kelembapan: 71,
  gas: 62,
  waktu: new Date()
};

const MOCK_NODES = [
  {
    id: 'node_1',
    name: 'Node 01 — Kawasan Inti',
    area: 'IKN Nusantara',
    lat: -1.034,
    lng: 116.735,
    status: 'on',
    statusLabel: 'Aktif · Aman',
    radiusMeters: 1000,
    suhu: 31.3,
    kelembapan: 71,
    gas: 62,
    streamUrl: null,
    lastSeen: 'baru saja'
  },
  {
    id: 'node_2',
    name: 'Node 02 — Koridor Hijau',
    area: 'IKN Timur',
    lat: -1.045,
    lng: 116.760,
    status: 'warn',
    statusLabel: 'Aktif · Waspada',
    radiusMeters: 800,
    suhu: 37.1,
    kelembapan: 48,
    gas: 95,
    streamUrl: null,
    lastSeen: '3 menit lalu'
  },
  {
    id: 'node_3',
    name: 'Node 03 — Zona Transisi',
    area: 'IKN Barat',
    lat: -1.020,
    lng: 116.710,
    status: 'on',
    statusLabel: 'Aktif · Aman',
    radiusMeters: 1200,
    suhu: 29.8,
    kelembapan: 76,
    gas: 45,
    streamUrl: null,
    lastSeen: 'baru saja'
  }
];

const MOCK_ALERTS = [
  { id: 'a1', cat: 'warning', title: 'Suhu Meningkat', msg: 'Node 02 mendeteksi suhu 37.1°C — melampaui ambang batas normal.', time: '26 Agt 2026, 14:32', read: false },
  { id: 'a2', cat: 'info', title: 'Sinkronisasi Berhasil', msg: 'Node 01 berhasil sinkronisasi data dengan server.', time: '26 Agt 2026, 14:28', read: false },
  { id: 'a3', cat: 'info', title: 'Node 03 Online', msg: 'Node 03 kembali aktif setelah pemeliharaan.', time: '26 Agt 2026, 13:45', read: true },
  { id: 'a4', cat: 'critical', title: 'Kelembapan Rendah', msg: 'Node 02 kelembapan 48% — risiko kebakaran meningkat!', time: '26 Agt 2026, 12:10', read: true },
];

// ============================================================
// TELEMETRI — satu node (Dasbor)
// ============================================================

export function subscribeTelemetry(nodeId, callback) {
  const nodeRef = ref(db, `sensor_nodes/${nodeId}`);

  const unsubscribe = onValue(nodeRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({
        suhu: data.suhu ?? 0,
        kelembapan: data.kelembapan ?? 0,
        gas: data.gas ?? data.asap ?? 0,
        waktu: new Date()
      });
    } else {
      // Fallback: pakai data mock kalau belum ada di Realtime DB
      callback({ ...MOCK_TELEMETRY, waktu: new Date() });
    }
  });

  return unsubscribe;
}

// ============================================================
// NODE SENSOR — semua node (Peta, Kamera, Dasbor)
// ============================================================

export function subscribeNodes(callback) {
  const nodesRef = ref(db, 'sensor_nodes');

  const unsubscribe = onValue(nodesRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      // Fallback: pakai data mock kalau belum ada di Realtime DB
      callback([...MOCK_NODES]);
      return;
    }

    const nodes = Object.entries(data).map(([id, nodeData]) => {
      let status = 'on';
      let statusLabel = 'Aktif · Aman';

      if (nodeData.status === 'warning') {
        status = 'warn';
        statusLabel = 'Aktif · Waspada';
      } else if (nodeData.status === 'fire risk' || nodeData.status === 'danger') {
        status = 'off';
        statusLabel = 'Bahaya!';
      } else if (!nodeData.suhu) {
        status = 'off';
        statusLabel = 'Offline';
      }

      return {
        id,
        name: nodeData.name || id,
        area: nodeData.area || '',
        lat: nodeData.lat || 0,
        lng: nodeData.lng || 0,
        status,
        statusLabel,
        radiusMeters: nodeData.radiusMeters || 1000,
        suhu: nodeData.suhu,
        kelembapan: nodeData.kelembapan,
        gas: nodeData.gas || nodeData.asap,
        streamUrl: nodeData.streamUrl || null,
        lastSeen: nodeData.lastSeen || 'baru saja'
      };
    });

    callback(nodes);
  });

  return unsubscribe;
}

// ============================================================
// ALERTS — riwayat notifikasi (Notifikasi, badge sidebar)
// ============================================================

export function subscribeAlerts(callback) {
  const alertsRef = ref(db, 'alerts_history');

  const unsubscribe = onValue(alertsRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      // Fallback: pakai data mock kalau belum ada di Realtime DB
      callback([...MOCK_ALERTS]);
      return;
    }

    const alerts = Object.entries(data)
      .map(([id, alertData]) => ({
        id,
        cat: alertData.cat || 'info',
        title: alertData.title || '',
        msg: alertData.msg || '',
        time: alertData.createdAt
          ? new Date(alertData.createdAt).toLocaleString('id-ID')
          : 'baru saja',
        read: alertData.read || false
      }))
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 50);

    callback(alerts);
  });

  return unsubscribe;
}

// ============================================================
// MARK ALL ALERTS READ
// ============================================================

export async function markAllAlertsRead() {
  const alertsRef = ref(db, 'alerts_history');

  return new Promise((resolve, reject) => {
    onValue(alertsRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        resolve();
        return;
      }

      const updates = {};
      Object.entries(data).forEach(([id, alert]) => {
        if (!alert.read) {
          updates[`alerts_history/${id}/read`] = true;
        }
      });

      try {
        await update(ref(db), updates);
        resolve();
      } catch (e) {
        reject(e);
      }
    }, { onlyOnce: true });
  });
}

// ============================================================
// THRESHOLDS — ambang batas (Pengaturan)
// ============================================================

const THRESHOLD_KEY = 'fg-thresholds';
const DEFAULT_THRESHOLDS = { suhuMax: 48, gasMax: 150, kelembapanMin: 30 };

export function getThresholds() {
  try {
    return { ...DEFAULT_THRESHOLDS, ...JSON.parse(localStorage.getItem(THRESHOLD_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_THRESHOLDS };
  }
}

export async function saveThresholds(values) {
  localStorage.setItem(THRESHOLD_KEY, JSON.stringify(values));
  // Simpan juga ke Realtime DB
  try {
    await set(ref(db, 'config/thresholds'), values);
  } catch (e) {
    console.warn('Gagal simpan thresholds ke Realtime DB:', e);
  }
}
