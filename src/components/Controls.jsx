import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

function Controls({ isRunning, onStart, onPause, onStep, onReset, speed, onSpeedChange, disabled }) {
  return (
    <section className="glass rounded-[28px] p-5 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Controls</p>
      <h2 className="mt-2 text-2xl font-bold">Drive the simulation clock</h2>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={16} />
          {isRunning ? 'Running' : 'Start / Resume'}
        </button>
        <button
          type="button"
          onClick={onPause}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
        >
          <Pause size={16} />
          Pause
        </button>
        <button
          type="button"
          onClick={onStep}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
        >
          <SkipForward size={16} />
          Step 1 Tick
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <label className="mt-6 block">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>Tick speed</span>
          <span>{speed} ms</span>
        </div>
        <input
          className="mt-3 w-full"
          type="range"
          min="150"
          max="1200"
          step="50"
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
      </label>
    </section>
  );
}

export default Controls;
