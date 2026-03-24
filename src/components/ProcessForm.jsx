import { Plus, Trash2 } from 'lucide-react';
import { isPriorityAlgorithm } from '../utils/helpers';

function ProcessForm({
  processes,
  selectedAlgorithm,
  timeQuantum,
  onProcessChange,
  onAddProcess,
  onRemoveProcess,
  onQuantumChange,
  onLoadSample,
}) {
  const showPriority = isPriorityAlgorithm(selectedAlgorithm);

  return (
    <section className="glass rounded-[28px] p-6 shadow-glow">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Process Editor</p>
          <h2 className="mt-2 text-2xl font-bold">Shape the workload</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onLoadSample}
            className="rounded-full border border-slate-300/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
          >
            Load Sample
          </button>
          <button
            type="button"
            onClick={onAddProcess}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
          >
            <Plus size={16} />
            Add Process
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto scrollbar-slim">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              <th className="px-3">Process ID</th>
              <th className="px-3">Arrival</th>
              <th className="px-3">Burst</th>
              <th className="px-3">Priority</th>
              <th className="px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, index) => (
              <tr key={`${process.id}-${index}`} className="glass rounded-2xl">
                <td className="px-3 py-3">
                  <input
                    value={process.id}
                    onChange={(event) => onProcessChange(index, 'id', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="0"
                    value={process.arrivalTime}
                    onChange={(event) => onProcessChange(index, 'arrivalTime', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="1"
                    value={process.burstTime}
                    onChange={(event) => onProcessChange(index, 'burstTime', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="0"
                    value={process.priority}
                    disabled={!showPriority}
                    onChange={(event) => onProcessChange(index, 'priority', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onRemoveProcess(index)}
                    disabled={processes.length === 1}
                    className="inline-flex rounded-full border border-rose-200 p-2 text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/60 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="glass rounded-3xl p-4">
          <span className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Time Quantum</span>
          <input
            type="number"
            min="1"
            value={timeQuantum}
            onChange={(event) => onQuantumChange(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900/70"
          />
        </label>
        <div className="glass rounded-3xl p-4 text-sm text-slate-600 dark:text-slate-300">
          Priority values are only used in priority scheduling. Smaller numbers represent higher priority, and ties preserve arrival order and original input order.
        </div>
      </div>
    </section>
  );
}

export default ProcessForm;
