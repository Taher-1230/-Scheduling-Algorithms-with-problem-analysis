function renderResourceDetails(resource) {
  if (resource.type === 'mutex') {
    return `owner: ${resource.owner ?? 'free'} | queue: ${resource.queue.join(', ') || 'empty'}`;
  }

  if (resource.type === 'semaphore') {
    return `count: ${resource.count} | queue: ${resource.queue.join(', ') || 'empty'}`;
  }

  if (resource.type === 'reader-writer') {
    return `writer: ${resource.activeWriter ?? 'none'} | readers: ${resource.activeReaders.join(', ') || 'none'}`;
  }

  return 'no details';
}

function ResourcePanel({ resources, sharedState }) {
  const entries = Object.entries(resources ?? {});

  return (
    <section className="glass rounded-[28px] p-5 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Synchronization</p>
      <h2 className="mt-2 text-2xl font-bold">Resources and shared state</h2>

      <div className="mt-5 grid gap-3">
        {entries.length ? (
          entries.map(([key, resource]) => (
            <div key={key} className="rounded-3xl border border-slate-200/60 p-4 dark:border-slate-700">
              <p className="text-sm font-semibold">{resource.name}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{renderResourceDetails(resource)}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-200/60 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            This scenario does not use synchronization primitives.
          </div>
        )}
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200/60 p-4 dark:border-slate-700">
        <p className="text-sm font-semibold">Shared State</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">
          {JSON.stringify(sharedState, null, 2)}
        </pre>
      </div>
    </section>
  );
}

export default ResourcePanel;
