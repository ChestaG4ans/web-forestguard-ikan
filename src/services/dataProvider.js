/*
 * Lapisan data aplikasi. Semua halaman membaca data lewat fungsi di sini.
 * Menggunakan Firebase Realtime Database sebagai backend (ForestGuard / FireForest PKM 2026).
 *
 * Skema Realtime Database (dari backend):
 *   /forest_data/{nodeId}   { flame, ppm, suhu }
 *   /logs/{logId}           { node, suhu, ppm, flame, timestamp }
 */

import { db } from './firebase';
import { ref, onValue, set, update, push } from 'firebase/database';

// ============================================================
// DATA MOCK — fallback saat Realtime DB belum ada data
// ============================================================

const MOCK_TELEMETRY = {
  suhu: 31.9,
  kelembapan: 0,
  gas: 0,
  flame: false,
  waktu: new Date()
};

const MOCK_NODES = [
  {
    id: 'N1',
    name: 'Node 01',
    area: 'Lokasi N1',
    lat: -1.034,
    lng: 116.735,
    status: 'on',
    statusLabel: 'Aktif',
    radiusMeters: 1000,
    suhu: 31.9,
    kelembapan: 0,
    gas: 0,
    flame: false,
    streamUrl: null,
    lastSeen: 'baru saja'
  },
  {
    id: 'N2',
    name: 'Node 02',
    area: 'Lokasi N2',
    lat: -1.045,
    lng: 116.760,
    status: 'warn',
    statusLabel: 'Aktif',
    radiusMeters: 800,
    suhu: 25.4,
    kelembapan: 0,
    gas: 0,
    flame: false,
    streamUrl: null,
    lastSeen: 'baru saja'
  }
];

const MOCK_ALERTS = [
  { id: 'a1', cat: 'warning', title: 'Flame Terdeteksi', msg: 'Node N1 mendeteksi api!', time: new Date().toISOString(), read: false },
  { id: 'a2', cat: 'info', title: 'Sensor Normal', msg: 'Semua sensor berjalan normal.', time: new Date().toISOString(), read: true },
];

// ============================================================
// TELEMETRI — satu node (Dasbor)
// ============================================================

export function subscribeTelemetry(nodeId, callback) {
  const nodeRef = ref(db, `forest_data/${nodeId}`);

  const unsubscribe = onValue(nodeRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({
        suhu: data.suhu ?? 0,
        kelembapan: 0, // RTDB kamu nggak punya kelembapan
        gas: data.ppm ?? 0,
        flame: data.flame ?? false,
        waktu: new Date()
      });
    } else {
      // Fallback: pakai data mock kalau belum ada
      callback({ ...MOCK_TELEMETRY, waktu: new Date() });
    }
  });

  return unsubscribe;
}

// ============================================================
// NODE SENSOR — semua node (Peta, Kamera, Dasbor)
// ============================================================

export function subscribeNodes(callback) {
  const forestDataRef = ref(db, 'forest_data');

  const unsubscribe = onValue(forestDataRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      // Fallback: pakai data mock
      callback([...MOCK_NODES]);
      return;
    }

    const nodes = Object.entries(data).map(([id, nodeData]) => {
      // Tentukan status dari flame detection
      let status = 'on';
      let statusLabel = 'Aktif';

      if (nodeData.flame === true) {
        status = 'warn';
        statusLabel = 'Api Terdeteksi!';
      } else if (!nodeData.suhu && !nodeData.ppm) {
        status = 'off';
        statusLabel = 'Offline';
      }

      return {
        id,
        name: `Node ${id}`,
        area: `Lokasi ${id}`,
        lat: id === 'N1' ? -1.034 : -1.045,
        lng: id === 'N1' ? 116.735 : 116.760,
        status,
        statusLabel,
        radiusMeters: 1000,
        suhu: nodeData.suhu ?? 0,
        kelembapan: 0,
        gas: nodeData.ppm ?? 0,
        flame: nodeData.flame ?? false,
        streamUrl: null,
        lastSeen: 'baru saja'
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
  const logsRef = ref(db, 'logs');

  const unsubscribe = onValue(logsRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) {
      callback([...MOCK_ALERTS]);
      return;
    }

    // Convert logs ke alerts
    const alerts = Object.entries(data)
      .map(([id, log]) => {
        let cat = 'info';
        let title = 'Sensor Normal';
        let msg = `Node ${log.node}: Suhu ${log.suhu}°C, PPM ${log.ppm}`;

        if (log.flame === 1) {
          cat = 'critical';
          title = '🔥 Api Terdeteksi!';
          msg = `Node ${log.node} mendeteksi api! Suhu: ${log.suhu}°C, PPM: ${log.ppm}`;
        } else if (log.ppm > 1000) {
          cat = 'warning';
          title = '⚠️ Gas Berlebih';
          msg = `Node ${log.node}: Kadar gas ${log.ppm} PPM`;
        } else if (log.suhu > 50) {
          cat = 'warning';
          title = '⚠️ Suhu Tinggi';
          msg = `Node ${log.node}: Suhu ${log.suhu}°C`;
        }

        return {
          id,
          cat,
          title,
          msg,
          time: log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : 'baru saja',
          read: false,
          flame: log.flame,
          suhu: log.suhu,
          ppm: log.ppm
        };
      })
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
  // Firebase RTDB logs sifatnya read-only dari sensor
  // Jadi markAllAlertsRead nggak perlu update apa-apa
  console.log('markAllAlertsRead called - logs are sensor data, skipping');
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
