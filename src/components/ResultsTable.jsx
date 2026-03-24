function ResultsTable({ results }) {
  return (
    <section className="glass rounded-[28px] p-6 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Results Table</p>
      <h2 className="mt-2 text-2xl font-bold">Per-process metrics</h2>

      <div className="mt-6 overflow-x-auto scrollbar-slim">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3">PID</th>
              <th className="px-3 py-3">AT</th>
              <th className="px-3 py-3">BT</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">CT</th>
              <th className="px-3 py-3">TAT</th>
              <th className="px-3 py-3">WT</th>
            </tr>
          </thead>
          <tbody>
            {results.rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200/60 dark:border-slate-800">
                <td className="px-3 py-4 font-semibold">{row.id}</td>
                <td className="px-3 py-4">{row.arrivalTime}</td>
                <td className="px-3 py-4">{row.burstTime}</td>
                <td className="px-3 py-4">{row.priority}</td>
                <td className="px-3 py-4">{row.completionTime}</td>
                <td className="px-3 py-4">{row.turnaroundTime}</td>
                <td className="px-3 py-4">{row.waitingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ResultsTable;
