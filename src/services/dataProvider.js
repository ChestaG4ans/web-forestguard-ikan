/*
 * Lapisan data aplikasi. Semua halaman membaca data lewat fungsi di sini.
 * Menggunakan Firebase Firestore sebagai backend (ForestGuard / FireForest PKM 2026).
 *
 * Skema Firestore:
 *   sensor_nodes/{id}   { name, area, lat, lng, status, suhu, kelembapan, asap, lastSeen, streamUrl }
 *   alerts_history/{id} { cat, title, msg, createdAt, read }
 *   config/thresholds   { suhuMax, gasMax, kelembapanMin }
 */

import { db } from './firebase';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  updateDoc,
  getDocs
} from 'firebase/firestore';

// ============================================================
// DATA MOCK — fallback saat Firestore belum ada data
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
  const docRef = doc(db, "sensor_nodes", nodeId);

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        suhu: data.suhu ?? 0,
        kelembapan: data.kelembapan ?? 0,
        gas: data.asap ?? data.gas ?? 0,
        waktu: new Date()
      });
    } else {
      // Fallback: pakai data mock kalau belum ada di Firestore
      callback({ ...MOCK_TELEMETRY, waktu: new Date() });
    }
  });

  return unsubscribe;
}

// ============================================================
// NODE SENSOR — semua node (Peta, Kamera, Dasbor)
// ============================================================

export function subscribeNodes(callback) {
  const nodesCol = collection(db, "sensor_nodes");

  const unsubscribe = onSnapshot(nodesCol, (snapshot) => {
    if (snapshot.empty) {
      // Fallback: pakai data mock kalau belum ada di Firestore
      callback([...MOCK_NODES]);
      return;
    }

    const nodes = snapshot.docs.map(doc => {
      const data = doc.data();
      let status = 'on';
      let statusLabel = 'Aktif · Aman';

      if (data.status === 'warning') {
        status = 'warn';
        statusLabel = 'Aktif · Waspada';
      } else if (data.status === 'fire risk' || data.status === 'danger') {
        status = 'off';
        statusLabel = 'Bahaya!';
      } else if (!data.suhu) {
        status = 'off';
        statusLabel = 'Offline';
      }

      return {
        id: doc.id,
        name: data.name || doc.id,
        area: data.area || '',
        lat: data.lat || 0,
        lng: data.lng || 0,
        status,
        statusLabel,
        radiusMeters: data.radiusMeters || 1000,
        suhu: data.suhu,
        kelembapan: data.kelembapan,
        gas: data.asap || data.gas,
        streamUrl: data.streamUrl || null,
        lastSeen: data.lastSeen || 'baru saja'
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
  const alertsCol = collection(db, "alerts_history");
  const q = query(alertsCol, orderBy("createdAt", "desc"), limit(50));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      // Fallback: pakai data mock kalau belum ada di Firestore
      callback([...MOCK_ALERTS]);
      return;
    }

    const alerts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        cat: data.cat || 'info',
        title: data.title || '',
        msg: data.msg || '',
        time: data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toLocaleString('id-ID')
          : 'baru saja',
        read: data.read || false
      };
    });
    callback(alerts);
  });

  return unsubscribe;
}

// ============================================================
// MARK ALL ALERTS READ
// ============================================================

export async function markAllAlertsRead() {
  const alertsCol = collection(db, "alerts_history");
  const q = query(alertsCol);
  const snapshot = await getDocs(q);

  const updates = snapshot.docs
    .filter(doc => !doc.data().read)
    .map(doc => updateDoc(doc.ref, { read: true }));

  await Promise.all(updates);
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
  // Simpan juga ke Firestore
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, "config", "thresholds"), values, { merge: true });
  } catch (e) {
    console.warn('Gagal simpan thresholds ke Firestore:', e);
  }
}
