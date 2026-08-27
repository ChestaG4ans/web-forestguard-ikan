/*
 * Konfigurasi Firebase untuk ForestGuard.
 * Pakai Firestore sebagai backend (ForestGuard / FireForest PKM 2026).
 *
 * Prioritas config:
 *   1. process.env / .env.local (VITE_FIREBASE_*)
 *   2. Fallback hardcoded (FireForest project)
 *
 * Best practice: Simpan kredensial di .env.local (VITE_FIREBASE_*)
 * dan jangan pernah commit .env.local ke git.
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAGEzQMxkkpgc85g8AO6frGRSz7INzSnUU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fireforest-fc4ec.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fireforest-fc4ec",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fireforest-fc4ec.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "267376899259",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:267376899259:web:5540efe367f3fe45ad659e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
