function MetricCard({ label, value, accent }) {
  return (
    <div className="glass rounded-3xl p-5 shadow-glow">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-3 flex items-end gap-3">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{
            color: accent,
            backgroundColor: `${accent}22`,
          }}
        >
          live
        </span>
      </div>
    </div>
  );
}

export default MetricCard;
