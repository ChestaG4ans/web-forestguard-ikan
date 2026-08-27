/*
 * Contoh integrasi Firestore. File ini tidak di-import — hanya referensi.
 * Salin isinya ke dataProvider.js saat menghubungkan ke Firebase, dengan
 * mempertahankan tanda tangan tiap fungsi.
 *
 * Setup:
 *   npm install firebase
 *   buat src/services/firebase.js untuk inisialisasi (lihat di bawah)
 *   simpan kredensial di .env.local (VITE_FIREBASE_*), jangan di-commit
 */

// src/services/firebase.js
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// const app = initializeApp({
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
// });
// export const db = getFirestore(app);

// subscribeTelemetry
// import { doc, onSnapshot } from 'firebase/firestore';
// export function subscribeTelemetry(nodeId, callback) {
//   return onSnapshot(doc(db, 'sensor_nodes', nodeId), (snap) => {
//     const d = snap.data();
//     if (d) callback({ suhu: d.suhu, kelembapan: d.kelembapan, gas: d.gas, waktu: d.lastSeen?.toDate?.() ?? new Date() });
//   });
// }

// subscribeNodes
// import { collection, onSnapshot } from 'firebase/firestore';
// export function subscribeNodes(callback) {
//   return onSnapshot(collection(db, 'sensor_nodes'), (snap) =>
//     callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
// }

// subscribeAlerts
// import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
// export function subscribeAlerts(callback) {
//   const q = query(collection(db, 'alerts_history'), orderBy('createdAt', 'desc'), limit(50));
//   return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
// }

// saveThresholds → setDoc(doc(db, 'config', 'thresholds'), values, { merge: true })
