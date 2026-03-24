import { algorithmOptions } from '../data/presets';

function InsightsPanel({ selectedAlgorithm, results }) {
  const currentAlgorithm = algorithmOptions.find((option) => option.key === selectedAlgorithm);
  const slowestProcess = [...results.rows].sort((left, right) => right.waitingTime - left.waitingTime)[0];
  const fastestProcess = [...results.rows].sort((left, right) => left.turnaroundTime - right.turnaroundTime)[0];

  return (
    <section className="glass rounded-[28px] p-6 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Insights</p>
      <h2 className="mt-2 text-2xl font-bold">What this run reveals</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
        <div className="rounded-3xl border border-slate-200/60 p-4 dark:border-slate-700">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Active Algorithm</p>
          <p className="mt-3 text-lg font-semibold">{currentAlgorithm?.label}</p>
        </div>
        <div className="rounded-3xl border border-slate-200/60 p-4 dark:border-slate-700">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Highest Wait</p>
          <p className="mt-3 text-lg font-semibold">
            {slowestProcess.id} · {slowestProcess.waitingTime}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200/60 p-4 dark:border-slate-700">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Fastest Finish</p>
          <p className="mt-3 text-lg font-semibold">
            {fastestProcess.id} · {fastestProcess.turnaroundTime}
          </p>
        </div>
      </div>
    </section>
  );
}

export default InsightsPanel;
