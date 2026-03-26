import { useEffect, useMemo, useRef, useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import Controls from './components/Controls';
import QueueView from './components/QueueView';
import GanttChart from './components/GanttChart';
import ComparisonChart from './components/ComparisonChart';
import ProcessEditor from './components/ProcessEditor';
import ResourcePanel from './components/ResourcePanel';
import ProcessTable from './components/ProcessTable';
import { ALGORITHMS } from './engine/scheduler';
import { buildEngine, runScenarioComparison } from './engine/simulationEngine';
import { createSchedulingScenario, defaultSchedulingProcesses, scenarioCatalog } from './data/scenarios';

const PROCESS_COLORS = ['#06b6d4', '#22c55e', '#f97316', '#f43f5e', '#8b5cf6', '#eab308', '#14b8a6'];

const buildColorMap = (rows) =>
  rows.reduce(
    (accumulator, row, index) => ({
      ...accumulator,
      [row.id]: PROCESS_COLORS[index % PROCESS_COLORS.length],
    }),
    { Idle: '#64748b' },
  );

const createProcess = (index) => ({
  id: `P${index + 1}`,
  arrivalTime: 0,
  burstTime: 3,
  priority: 1,
});

const validateSchedulingInput = (processes, timeQuantum) => {
  for (const process of processes) {
    if (!process.id?.trim()) {
      return 'Every process needs a Process ID.';
    }

    if (Number(process.arrivalTime) < 0 || Number.isNaN(Number(process.arrivalTime))) {
      return `Arrival time for ${process.id} must be 0 or greater.`;
    }

    if (Number(process.burstTime) <= 0 || Number.isNaN(Number(process.burstTime))) {
      return `Burst time for ${process.id} must be greater than 0.`;
    }
  }

  if (Number(timeQuantum) <= 0 || Number.isNaN(Number(timeQuantum))) {
    return 'Time quantum must be greater than 0.';
  }

  return '';
};

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [scenarioKey, setScenarioKey] = useState('scheduling');
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [speed, setSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [processInputs, setProcessInputs] = useState(defaultSchedulingProcesses);
  const [snapshot, setSnapshot] = useState({
    time: 0,
    readyQueue: [],
    waitingQueue: [],
    currentProcessId: null,
    gantt: [],
    processes: [],
    metrics: {
      rows: [],
      averageWaitingTime: 0,
      averageTurnaroundTime: 0,
    },
    resources: {},
    sharedState: {},
    finished: false,
  });
  const [comparisonResults, setComparisonResults] = useState({});
  const engineRef = useRef(null);

  const hasStarted = snapshot.gantt.length > 0 || snapshot.time > 0 || snapshot.finished;
  const selectedScenario = scenarioCatalog.find((scenario) => scenario.key === scenarioKey);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const buildScenarioConfig = () => {
    if (scenarioKey === 'scheduling') {
      return createSchedulingScenario(processInputs);
    }

    return selectedScenario.build();
  };

  const resetSimulation = () => {
    const nextError =
      scenarioKey === 'scheduling' ? validateSchedulingInput(processInputs, timeQuantum) : '';

    if (nextError) {
      setError(nextError);
      return false;
    }

    const scenarioConfig = buildScenarioConfig();
    const engine = buildEngine(scenarioConfig, { algorithm, timeQuantum });
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());
    setComparisonResults(runScenarioComparison(scenarioConfig, { algorithm, timeQuantum }));
    setError('');
    setIsRunning(false);
    return true;
  };

  useEffect(() => {
    if (!hasStarted) {
      resetSimulation();
    }
  }, [scenarioKey, algorithm, timeQuantum, processInputs]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (!engineRef.current) {
        return;
      }

      const nextSnapshot = engineRef.current.tick();
      setSnapshot(nextSnapshot);

      if (nextSnapshot.finished) {
        setIsRunning(false);
      }
    }, speed);

    return () => window.clearTimeout(timer);
  }, [isRunning, speed, snapshot.time]);

  const colors = useMemo(() => buildColorMap(snapshot.processes), [snapshot.processes]);

  const handleStart = () => {
    if (!engineRef.current && !resetSimulation()) {
      return;
    }

    if (snapshot.finished) {
      if (!resetSimulation()) {
        return;
      }
    }

    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStep = () => {
    if (!engineRef.current && !resetSimulation()) {
      return;
    }

    setIsRunning(false);
    const nextSnapshot = engineRef.current.tick();
    setSnapshot(nextSnapshot);
  };

  const handleReset = () => {
    resetSimulation();
  };

  const metrics = snapshot.metrics;
  const sharedCounter = snapshot.sharedState.counter;
  const bufferSize = snapshot.sharedState.buffer?.length;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="glass rounded-[32px] p-6 shadow-glow">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.32em] text-teal-600 dark:text-teal-300">Operating System Simulator</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                A discrete-time OS lab for scheduling, blocking, synchronization, and recovery.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Every tick moves arrivals into queues, lets the scheduler choose a runnable process, executes one CPU unit, applies mutex or semaphore rules, and updates READY, WAITING, RUNNING, and TERMINATED states in real time.
              </p>
            </div>

            <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((current) => !current)} />
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-3xl border border-rose-300 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="glass rounded-[28px] p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Scenario</p>
            <h2 className="mt-2 text-2xl font-bold">Choose the operating system problem</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {scenarioCatalog.map((scenario) => (
                <button
                  key={scenario.key}
                  type="button"
                  disabled={hasStarted}
                  onClick={() => setScenarioKey(scenario.key)}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    scenario.key === scenarioKey
                      ? 'border-teal-500 bg-teal-500/10 text-slate-900 dark:text-white'
                      : 'border-slate-200/70 text-slate-600 hover:border-teal-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">{scenario.label}</div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {selectedScenario?.description}
            </p>
          </div>

          <div className="glass rounded-[28px] p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Scheduler</p>
            <h2 className="mt-2 text-2xl font-bold">Pick the dispatch strategy</h2>
            <div className="mt-5 grid gap-3">
              {ALGORITHMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={hasStarted}
                  onClick={() => setAlgorithm(item.key)}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    item.key === algorithm
                      ? 'border-teal-500 bg-teal-500/10 text-slate-900 dark:text-white'
                      : 'border-slate-200/70 text-slate-600 hover:border-teal-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                </button>
              ))}
            </div>

            <label className="mt-5 block text-sm text-slate-600 dark:text-slate-300">
              Round Robin quantum
              <input
                type="number"
                min="1"
                disabled={hasStarted}
                value={timeQuantum}
                onChange={(event) => setTimeQuantum(Number(event.target.value))}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70"
              />
            </label>
          </div>
        </section>

        {scenarioKey === 'scheduling' ? (
          <div className="mt-8">
            <ProcessEditor
              processes={processInputs}
              disabled={hasStarted}
              onAdd={() => setProcessInputs((current) => [...current, createProcess(current.length)])}
              onRemove={(index) =>
                setProcessInputs((current) =>
                  current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index),
                )
              }
              onChange={(index, field, value) =>
                setProcessInputs((current) =>
                  current.map((process, currentIndex) =>
                    currentIndex === index ? { ...process, [field]: value } : process,
                  ),
                )
              }
            />
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Controls
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onStep={handleStep}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={setSpeed}
            disabled={snapshot.finished}
          />
          <QueueView
            currentProcessId={snapshot.currentProcessId}
            readyQueue={snapshot.readyQueue}
            waitingQueue={snapshot.waitingQueue}
          />
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="glass rounded-3xl p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Current Time</p>
            <p className="mt-3 text-3xl font-bold">{snapshot.time}</p>
          </div>
          <div className="glass rounded-3xl p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Avg Waiting Time</p>
            <p className="mt-3 text-3xl font-bold">{metrics.averageWaitingTime}</p>
          </div>
          <div className="glass rounded-3xl p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Avg Turnaround Time</p>
            <p className="mt-3 text-3xl font-bold">{metrics.averageTurnaroundTime}</p>
          </div>
          <div className="glass rounded-3xl p-5 shadow-glow">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Shared Focus</p>
            <p className="mt-3 text-lg font-bold">
              {typeof sharedCounter === 'number'
                ? `counter = ${sharedCounter}`
                : typeof bufferSize === 'number'
                  ? `buffer = ${bufferSize}`
                  : snapshot.currentProcessId ?? 'Idle'}
            </p>
          </div>
        </section>

        <div className="mt-8">
          <GanttChart timeline={snapshot.gantt} colors={colors} currentTime={snapshot.time} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ProcessTable rows={snapshot.processes} />
          <ResourcePanel resources={snapshot.resources} sharedState={snapshot.sharedState} />
        </div>

        <div className="mt-8">
          <ComparisonChart allResults={comparisonResults} />
        </div>
      </main>
    </div>
  );
}

export default App;
