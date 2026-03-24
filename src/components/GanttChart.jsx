function GanttChart({ segments, colors, playbackIndex, speed, onSpeedChange, onStep, onPlayToggle, isPlaying }) {
  const visibleSegments =
    playbackIndex === null ? segments : segments.slice(0, Math.max(1, playbackIndex + 1));
  const totalDuration = segments.at(-1)?.end ?? 0;

  return (
    <section className="glass rounded-[28px] p-6 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Gantt Chart</p>
          <h2 className="mt-2 text-2xl font-bold">Timeline of execution</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPlayToggle}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={onStep}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
          >
            Step
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            Speed
            <input
              type="range"
              min="200"
              max="1600"
              step="100"
              value={speed}
              onChange={(event) => onSpeedChange(Number(event.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto scrollbar-slim">
        <div className="min-w-[720px]">
          <div className="relative flex h-24 overflow-hidden rounded-[24px] border border-slate-200/60 dark:border-slate-700">
            {visibleSegments.map((segment, index) => (
              <div
                key={`${segment.processId}-${segment.start}-${index}`}
                className="relative flex h-full items-center justify-center border-r border-white/20 text-sm font-semibold text-white transition-all duration-500"
                style={{
                  width: `${(segment.duration / Math.max(totalDuration, 1)) * 100}%`,
                  backgroundColor: colors[segment.processId],
                }}
              >
                <span className="drop-shadow">{segment.processId}</span>
                <div className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-between text-[10px] font-medium text-white/90">
                  <span>{segment.start}</span>
                  <span>{segment.end}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            {Array.from({ length: totalDuration + 1 }, (_, marker) => (
              <span key={marker}>{marker}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {Object.entries(colors).map(([processId, color]) => (
          <div key={processId} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            {processId}
          </div>
        ))}
      </div>
    </section>
  );
}

export default GanttChart;
