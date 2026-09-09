/*
 * Lapisan data aplikasi. Semua halaman membaca data lewat fungsi di sini.
 * Menggunakan Cloudflare Worker Proxy untuk akses Firebase RTDB (ForestGuard PKM 2026).
 *
 * Worker proxy menghindari CORS blocking dari Cloudflare Pages ke Firebase RTDB.
 *
 * Skema Realtime Database:
 *   /forest_data/{nodeId}   { flame, ppm, suhu }
 *   /logs/{logId}           { node, suhu, ppm, flame, timestamp }
 */

const API_BASE_URL = "https://apifireforest.chestaadabikarnen03.workers.dev";

// ============================================================
// DATA MOCK — fallback saat API gagal
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
    suhu: 125,
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
// HELPER: Fetch dari Worker Proxy
// ============================================================

async function fetchAPI(path) {
  try {
    const response = await fetch(`${API_BASE_URL}/${path}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();

    // Worker returns null for empty paths
    if (data === null) return null;
    return data;
  } catch (error) {
    console.warn(`API error for ${path}:`, error);
    return null;
  }
}

// ============================================================
// POLLING UNTUK REALTIME
// ============================================================

let pollingIntervals = {};

export function cleanupAllSubscriptions() {
  Object.values(pollingIntervals).forEach(interval => clearInterval(interval));
  Object.keys(pollingIntervals).forEach(key => delete pollingIntervals[key]);
}

// ============================================================
// TELEMETRI — satu node (Dasbor)
// ============================================================

export function subscribeTelemetry(nodeId, callback) {
  // Initial fetch
  fetchAPI(`forest_data/${nodeId}`).then(data => {
    if (data) {
      callback({
        suhu: data.suhu ?? 0,
        kelembapan: 0,
        gas: data.ppm ?? 0,
        flame: data.flame ?? false,
        waktu: new Date()
      });
    } else {
      callback({ ...MOCK_TELEMETRY, waktu: new Date() });
    }
  });

  // Poll setiap 3 detik
  const interval = setInterval(async () => {
    const data = await fetchAPI(`forest_data/${nodeId}`);
    if (data) {
      callback({
        suhu: data.suhu ?? 0,
        kelembapan: 0,
        gas: data.ppm ?? 0,
        flame: data.flame ?? false,
        waktu: new Date()
      });
    }
  }, 3000);

  pollingIntervals[`telemetry_${nodeId}`] = interval;

  return () => {
    clearInterval(interval);
    delete pollingIntervals[`telemetry_${nodeId}`];
  };
}

// ============================================================
// NODE SENSOR — semua node (Peta, Kamera, Dasbor)
// ============================================================

export function subscribeNodes(callback) {
  // Initial fetch
  fetchAPI('forest_data').then(data => {
    if (data && typeof data === 'object') {
      const nodes = Object.entries(data).map(([id, nodeData]) => {
        let status = 'on';
        let statusLabel = 'Aktif';

        if (nodeData.flame === true || nodeData.flame === 1) {
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
    } else {
      callback([...MOCK_NODES]);
    }
  });

  // Poll setiap 3 detik
  const interval = setInterval(async () => {
    const data = await fetchAPI('forest_data');
    if (data && typeof data === 'object') {
      const nodes = Object.entries(data).map(([id, nodeData]) => {
        let status = 'on';
        let statusLabel = 'Aktif';

        if (nodeData.flame === true || nodeData.flame === 1) {
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
    }
  }, 3000);

  pollingIntervals['nodes'] = interval;

  return () => {
    clearInterval(interval);
    delete pollingIntervals['nodes'];
  };
}

// ============================================================
// ALERTS — riwayat notifikasi (Notifikasi, badge sidebar)
// ============================================================

export function subscribeAlerts(callback) {
  // Initial fetch
  fetchAPI('logs').then(data => {
    if (data && typeof data === 'object') {
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
    } else {
      callback([...MOCK_ALERTS]);
    }
  });

  // Poll setiap 5 detik
  const interval = setInterval(async () => {
    const data = await fetchAPI('logs');
    if (data && typeof data === 'object') {
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
    }
  }, 5000);

  pollingIntervals['alerts'] = interval;

  return () => {
    clearInterval(interval);
    delete pollingIntervals['alerts'];
  };
}

// ============================================================
// MARK ALL ALERTS READ
// ============================================================

export async function markAllAlertsRead() {
  // Logs sifatnya read-only dari sensor
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
}
