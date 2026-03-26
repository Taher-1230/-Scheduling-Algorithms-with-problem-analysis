const compressTimeline = (timeline) => {
  const segments = [];

  for (const tick of timeline) {
    const previous = segments[segments.length - 1];

    if (previous && previous.processId === tick.processId && previous.end === tick.time) {
      previous.end += 1;
      previous.duration += 1;
    } else {
      segments.push({
        processId: tick.processId,
        start: tick.time,
        end: tick.time + 1,
        duration: 1,
      });
    }
  }

  return segments;
};

function GanttChart({ timeline, colors, currentTime }) {
  const segments = compressTimeline(timeline);
  const totalDuration = timeline.length;

  return (
    <section className="glass rounded-[28px] p-6 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Gantt Chart</p>
          <h2 className="mt-2 text-2xl font-bold">Real-time CPU execution</h2>
        </div>
        <div className="rounded-full border border-slate-300/70 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
          Current time: t = {currentTime}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto scrollbar-slim">
        <div className="min-w-[720px]">
          <div className="relative flex h-24 overflow-hidden rounded-[24px] border border-slate-200/60 dark:border-slate-700">
            {segments.map((segment, index) => (
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
