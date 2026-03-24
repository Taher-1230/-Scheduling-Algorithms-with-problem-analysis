import { algorithmOptions } from '../data/presets';

function AlgorithmSelector({ selectedAlgorithm, onChange }) {
  return (
    <section className="glass rounded-[28px] p-6 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Algorithms</p>
      <h2 className="mt-2 text-2xl font-bold">Choose the active simulation</h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {algorithmOptions.map((option) => {
          const active = option.key === selectedAlgorithm;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={`rounded-3xl border px-4 py-4 text-left transition ${
                active
                  ? 'border-teal-500 bg-teal-500/10 text-slate-900 dark:text-white'
                  : 'border-slate-200/70 text-slate-600 hover:border-teal-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <div className="text-sm font-semibold">{option.label}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {active ? 'selected' : 'available'}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default AlgorithmSelector;
