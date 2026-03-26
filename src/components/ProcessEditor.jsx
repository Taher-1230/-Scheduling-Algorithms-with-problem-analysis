function ProcessEditor({ processes, onChange, onAdd, onRemove, disabled }) {
  return (
    <section className="glass rounded-[28px] p-5 shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Process Input</p>
          <h2 className="mt-2 text-2xl font-bold">Custom scheduling workload</h2>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add Process
        </button>
      </div>

      <div className="mt-5 overflow-x-auto scrollbar-slim">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3">PID</th>
              <th className="px-3 py-3">Arrival</th>
              <th className="px-3 py-3">Burst</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process, index) => (
              <tr key={`${process.id}-${index}`} className="border-t border-slate-200/60 dark:border-slate-800">
                <td className="px-3 py-3">
                  <input
                    value={process.id}
                    disabled={disabled}
                    onChange={(event) => onChange(index, 'id', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="0"
                    value={process.arrivalTime}
                    disabled={disabled}
                    onChange={(event) => onChange(index, 'arrivalTime', Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="1"
                    value={process.burstTime}
                    disabled={disabled}
                    onChange={(event) => onChange(index, 'burstTime', Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    min="0"
                    value={process.priority}
                    disabled={disabled}
                    onChange={(event) => onChange(index, 'priority', Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70"
                  />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={disabled || processes.length === 1}
                    className="rounded-full border border-rose-300 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ProcessEditor;
