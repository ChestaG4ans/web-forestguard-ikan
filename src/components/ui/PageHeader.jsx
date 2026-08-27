import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

/** Kepala halaman: eyebrow hijau + judul display + deskripsi + aksi kanan. */
export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <motion.div
      variants={fadeUp}
      className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6"
    >
      <div>
        <div className="mb-2 text-[0.7rem] font-bold tracking-[0.2em] text-ok uppercase">{eyebrow}</div>
        <h1 className="font-display text-[2rem] leading-[1.02] font-bold tracking-tight text-ink md:text-[2.5rem]">{title}</h1>
        {description && <p className="mt-2 text-[0.95rem] text-sage">{description}</p>}
      </div>
      {children}
    </motion.div>
  );
}
