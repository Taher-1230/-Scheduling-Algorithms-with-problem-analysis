function QueueRow({ title, items, accent }) {
  return (
    <div className="rounded-3xl border border-slate-200/60 p-4 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: accent, backgroundColor: `${accent}22` }}
        >
          {items.length}
        </span>
      </div>
      <div className="mt-3 flex min-h-14 flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-300/70 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500 dark:text-slate-400">No processes</span>
        )}
      </div>
    </div>
  );
}

function QueueView({ currentProcessId, readyQueue, waitingQueue }) {
  return (
    <section className="glass rounded-[28px] p-5 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Queues</p>
      <h2 className="mt-2 text-2xl font-bold">Live scheduler state</h2>

      <div className="mt-5 grid gap-4">
        <QueueRow title="Running" items={currentProcessId ? [currentProcessId] : []} accent="#06b6d4" />
        <QueueRow title="Ready Queue" items={readyQueue} accent="#14b8a6" />
        <QueueRow title="Waiting Queue" items={waitingQueue} accent="#f97316" />
      </div>
    </section>
  );
}

export default QueueView;
