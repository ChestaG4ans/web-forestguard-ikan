/** Pil status kecil huruf kapital — AMAN / WASPADA / dsb. */
export default function StatusPill({ tone = 'ok', children }) {
  const tones = {
    ok: 'border-[#b3bd94] text-[#5f7250]',
    warn: 'border-[#e0c48a] text-[#b07a1e]',
    danger: 'border-[#f2c9c2] text-danger',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-[0.64rem] font-bold tracking-[0.1em] uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}
