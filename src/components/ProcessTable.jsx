function ProcessTable({ rows }) {
  return (
    <section className="glass rounded-[28px] p-5 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Processes</p>
      <h2 className="mt-2 text-2xl font-bold">State transitions and metrics</h2>

      <div className="mt-5 overflow-x-auto scrollbar-slim">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3">PID</th>
              <th className="px-3 py-3">State</th>
              <th className="px-3 py-3">AT</th>
              <th className="px-3 py-3">BT</th>
              <th className="px-3 py-3">Remaining</th>
              <th className="px-3 py-3">CT</th>
              <th className="px-3 py-3">TAT</th>
              <th className="px-3 py-3">WT</th>
              <th className="px-3 py-3">Blocked Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200/60 dark:border-slate-800">
                <td className="px-3 py-3 font-semibold">{row.id}</td>
                <td className="px-3 py-3">{row.state}</td>
                <td className="px-3 py-3">{row.arrivalTime}</td>
                <td className="px-3 py-3">{row.burstTime}</td>
                <td className="px-3 py-3">{row.remainingCpuTime}</td>
                <td className="px-3 py-3">{row.completionTime ?? '-'}</td>
                <td className="px-3 py-3">{row.turnaroundTime ?? '-'}</td>
                <td className="px-3 py-3">{row.waitingTime}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{row.blockedReason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ProcessTable;
