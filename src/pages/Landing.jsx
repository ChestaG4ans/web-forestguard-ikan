import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gauge, MapPinned } from 'lucide-react';
import { stagger, fadeUp } from '../lib/motion';

const BIRDS = [
  { left: '11%', top: '11%', w: 48, o: 0.6, anim: 'fg-bird 15s ease-in-out infinite' },
  { left: '17%', top: '20%', w: 38, o: 0.52, anim: 'fg-bird 18s ease-in-out infinite 1.1s' },
  { left: '24%', top: '14%', w: 30, o: 0.46, anim: 'fg-bird-2 22s ease-in-out infinite 2s' },
  { left: '46%', top: '9%', w: 30, o: 0.44, anim: 'fg-bird 20s ease-in-out infinite 0.8s' },
  { right: '28%', top: '13%', w: 42, o: 0.56, anim: 'fg-bird 16s ease-in-out infinite 0.5s' },
  { right: '19%', top: '23%', w: 32, o: 0.46, anim: 'fg-bird-2 23s ease-in-out infinite 1.5s' },
  { right: '10%', top: '9%', w: 36, o: 0.5, anim: 'fg-bird 19s ease-in-out infinite 2.4s' },
  { left: '5%', top: '44%', w: 36, o: 0.46, anim: 'fg-bird 17s ease-in-out infinite 0.4s' },
  { left: '9%', top: '54%', w: 26, o: 0.36, anim: 'fg-bird-2 21s ease-in-out infinite 1.6s' },
  { right: '5%', top: '46%', w: 36, o: 0.46, anim: 'fg-bird-2 18s ease-in-out infinite 0.7s' },
  { right: '10%', top: '56%', w: 26, o: 0.36, anim: 'fg-bird 22s ease-in-out infinite 1.9s' },
];

const SPONSORS = [
  { src: '/img/sponsor-6.png', alt: 'Diktisaintek Berdampak', h: 22 },
  { src: '/img/sponsor-1.png', alt: 'Kemendikbud', h: 30 },
  { src: '/img/sponsor-4.png', alt: 'PKM', h: 25 },
  { src: '/img/sponsor-38.png', alt: 'SIMBELMAWA', h: 18 },
  { src: '/img/sponsor-belmawa.png', alt: 'Belmawa', h: 27 },
  { src: '/img/sponsor-5.png', alt: 'Universitas Gunadarma', h: 30 },
];

function Bird({ left, right, top, w, o, anim }) {
  return (
    <svg
      viewBox="0 0 46 14"
      className="absolute"
      style={{ left, right, top, width: w, opacity: o, animation: anim }}
    >
      <path d="M2 11 Q11 2 23 9 Q35 2 44 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="relative flex h-svh min-h-[560px] flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f6f7f3_46%,#eef1ea_100%)]">
      {/* pendar warna lembut */}
      <div
        aria-hidden
        className="anim-drift pointer-events-none absolute inset-0 z-0 opacity-55"
        style={{
          background:
            'radial-gradient(50% 42% at 26% 22%, rgba(210,175,82,0.10), transparent 70%), radial-gradient(46% 40% at 80% 26%, rgba(47,112,72,0.09), transparent 70%)',
        }}
      />

      {/* kabut atas */}
      <div aria-hidden className="ambient pointer-events-none absolute inset-x-0 top-0 z-[1] h-[210px] overflow-hidden">
        <div
          className="absolute -top-[70px] -right-[4%] -left-[4%] h-[200px] blur-[18px]"
          style={{
            background:
              'radial-gradient(60% 100% at 30% 40%, rgba(38,50,58,0.28), transparent 70%), radial-gradient(60% 100% at 72% 30%, rgba(30,42,50,0.3), transparent 70%), linear-gradient(180deg, rgba(34,46,54,0.26), rgba(34,46,54,0.06) 70%, transparent)',
            animation: 'fg-cloud 26s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* awan + burung */}
      <div aria-hidden className="ambient pointer-events-none absolute inset-x-0 top-0 z-[1] h-[72%] overflow-hidden text-[#546471]">
        <div
          className="absolute -top-[6%] -left-[8%] h-[150px] w-[60%] rounded-full blur-[26px]"
          style={{ background: 'radial-gradient(50% 60% at 50% 50%, rgba(64,78,72,0.16), transparent 72%)', animation: 'fg-cloud 34s ease-in-out infinite alternate' }}
        />
        <div
          className="absolute top-[2%] -right-[10%] h-[170px] w-[64%] rounded-full blur-[30px]"
          style={{ background: 'radial-gradient(50% 60% at 50% 50%, rgba(52,66,74,0.15), transparent 72%)', animation: 'fg-cloud 40s ease-in-out infinite alternate-reverse' }}
        />
        <div
          className="absolute top-[40%] -left-[8%] h-[170px] w-[32%] rounded-full blur-[26px]"
          style={{ background: 'radial-gradient(50% 60% at 50% 50%, rgba(38,50,58,0.17), transparent 70%)', animation: 'fg-cloud 44s ease-in-out infinite alternate' }}
        />
        <div
          className="absolute top-[44%] -right-[8%] h-[180px] w-[34%] rounded-full blur-[28px]"
          style={{ background: 'radial-gradient(50% 60% at 50% 50%, rgba(36,48,54,0.16), transparent 70%)', animation: 'fg-cloud 50s ease-in-out infinite alternate-reverse' }}
        />
        {BIRDS.map((b, i) => (
          <Bird key={i} {...b} />
        ))}
      </div>

      {/* horizon: gedung IKN + treeline */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[clamp(150px,26vh,250px)]">
        <img
          src="/img/ikn-building-cut.png"
          alt=""
          className="absolute left-1/2 h-[clamp(78px,13vh,140px)] w-auto max-w-[92%] -translate-x-1/2 opacity-16 [mask-image:linear-gradient(180deg,transparent,#000_34%)]"
          style={{ bottom: 'clamp(56px,10vh,104px)' }}
        />
        <img
          src="/img/forest-treeline.png"
          alt=""
          className="absolute bottom-0 left-0 h-[clamp(110px,18vh,180px)] w-full object-cover object-bottom [mask-image:linear-gradient(180deg,transparent,#000_46%)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-[linear-gradient(180deg,transparent,#eef1ea_90%)]" />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-[5] flex min-h-0 flex-1 flex-col">
        {/* header */}
        <motion.header variants={fadeUp} className="flex shrink-0 items-center justify-between px-5 py-4 md:px-12">
          <div className="flex items-center gap-3">
            <img src="/img/logo-emblem.png" alt="FORESTGUARD-IKN" className="h-[42px] w-[42px] object-contain" />
            <div className="leading-none">
              <div className="font-display text-[0.98rem] font-bold text-navy">
                FORESTGUARD<span className="text-gold">-IKN</span>
              </div>
              <div className="mt-1 font-mono text-[0.58rem] font-medium tracking-[0.2em] text-ok">PKM-KC 2026</div>
            </div>
          </div>
          <Link
            to="/dasbor"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-[0.84rem] font-bold text-white shadow-[0_8px_22px_rgba(20,48,77,0.16)] transition-transform hover:-translate-y-0.5"
          >
            Masuk Dasbor <ArrowRight size={15} />
          </Link>
        </motion.header>

        {/* baris sponsor */}
        <motion.div variants={fadeUp} className="flex shrink-0 justify-center px-5 pb-1.5">
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-[44px] border border-[#ecebe3] bg-white/72 px-6 py-2 shadow-[0_6px_20px_rgba(20,48,77,0.06)] backdrop-blur-[10px] md:gap-8">
            <span className="text-[0.6rem] font-extrabold tracking-[0.2em] text-[#9aa4ae]">DIDUKUNG&nbsp;OLEH</span>
            {SPONSORS.map((s) => (
              <img key={s.src} src={s.src} alt={s.alt} style={{ height: s.h }} className="object-contain" />
            ))}
          </div>
        </motion.div>

        {/* hero */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-[clamp(150px,24vh,240px)] text-center">
          <motion.div variants={fadeUp} className="relative mb-[clamp(8px,1.6vh,18px)]">
            <div className="anim-glow absolute top-1/2 left-1/2 h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle,rgba(210,175,82,0.28),transparent_68%)]" />
            <img
              src="/img/logo-emblem.png"
              alt="Logo FORESTGUARD-IKN"
              className="anim-float relative z-[1] h-[clamp(96px,15vh,158px)] w-[clamp(96px,15vh,158px)] object-contain"
            />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display text-[clamp(2.1rem,6vw,4.2rem)] leading-none font-extrabold tracking-tight text-navy"
          >
            FORESTGUARD<span className="text-gold">-IKN</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-[clamp(12px,2vh,20px)] max-w-[600px] text-[clamp(0.95rem,1.6vw,1.12rem)] leading-relaxed text-[#48586a] [text-wrap:pretty]"
          >
            Sistem pemantauan cerdas berbasis sensor &amp; visi komputer untuk deteksi dini kebakaran hutan di kawasan Ibu
            Kota Nusantara.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-[clamp(18px,3vh,30px)] flex flex-wrap justify-center gap-3">
            <Link
              to="/dasbor"
              className="inline-flex items-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#c79a37,#b8862f)] px-8 py-3.5 text-[0.98rem] font-bold text-white shadow-[0_14px_30px_rgba(184,134,47,0.32)] transition-transform hover:-translate-y-0.5"
            >
              Buka Dasbor Pemantauan <Gauge size={17} />
            </Link>
            <Link
              to="/peta"
              className="inline-flex items-center gap-2.5 rounded-full border border-[#e2e1d8] bg-white px-7 py-3.5 text-[0.98rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
            >
              Peta IKN <MapPinned size={17} className="text-ok" />
            </Link>
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
