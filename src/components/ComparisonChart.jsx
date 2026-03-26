import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ALGORITHMS } from '../engine/scheduler';

function ComparisonChart({ allResults }) {
  const data = ALGORITHMS.map((algorithm) => ({
    name: algorithm.label,
    waitingTime: allResults?.[algorithm.key]?.averageWaitingTime ?? 0,
    turnaroundTime: allResults?.[algorithm.key]?.averageTurnaroundTime ?? 0,
  }));

  return (
    <section className="glass rounded-[28px] p-6 shadow-glow">
      <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Comparison</p>
      <h2 className="mt-2 text-2xl font-bold">Run the same workload across all schedulers</h2>

      <div className="mt-6 h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid rgba(148,163,184,0.18)',
                background: 'rgba(15,23,42,0.92)',
                color: '#e2e8f0',
              }}
            />
            <Legend />
            <Bar dataKey="waitingTime" name="Avg WT" fill="#14b8a6" radius={[12, 12, 0, 0]} />
            <Bar dataKey="turnaroundTime" name="Avg TAT" fill="#f97316" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default ComparisonChart;
