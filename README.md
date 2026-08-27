# ForestGuard IKN - Web Frontend

Dashboard pemantauan kebakaran hutan kawasan IKN menggunakan Visi Komputer (YOLOv8) dan IoT Sensor.

## 🔗 Links

- **Live Demo**: https://web-forestguard.pages.dev
- **Backend API**: (deploy ke Railway/DigitalOcean)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build
```

## 📁 Structure

```
src/
├── components/    # UI components
├── hooks/        # React hooks
├── lib/          # Utilities
├── pages/        # Page components
└── services/     # API services (Firebase, YOLO)
```

## 🔥 Features

- Real-time sensor monitoring (temperature, humidity, gas)
- Live camera streaming dengan YOLO detection (fire/smoke)
- Interactive map dengan sensor node locations
- Alert system dengan notifikasi
- Dashboard dengan analytics

## 🛠️ Tech Stack

- **React** + **Vite**
- **Tailwind CSS** v4
- **Firebase** Firestore
- **YOLOv8** (via backend API)
- **Framer Motion** (animations)
- **Recharts** (charts)
- **Leaflet** (maps)

## 🌐 Environment Variables

Salin `.env.example` ke `.env.local` dan isi dengan Firebase credentials.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_YOLO_API_URL=https://your-backend-api.com
```

## 📜 License

MIT License - PKM-KC 2026, Universitas Gunadarma
