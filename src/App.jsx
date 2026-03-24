import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, PlayCircle, RefreshCcw } from 'lucide-react';
import AlgorithmSelector from './components/AlgorithmSelector';
import ComparisonChart from './components/ComparisonChart';
import GanttChart from './components/GanttChart';
import InsightsPanel from './components/InsightsPanel';
import MetricCard from './components/MetricCard';
import ProcessForm from './components/ProcessForm';
import ResultsTable from './components/ResultsTable';
import ThemeToggle from './components/ThemeToggle';
import { defaultProcesses } from './data/presets';
import { buildColorMap, downloadBlob, validateProcesses } from './utils/helpers';
import { runAlgorithm, runAllAlgorithms } from './utils/scheduling';

const createEmptyProcess = (index) => ({
  id: `P${index + 1}`,
  arrivalTime: 0,
  burstTime: 1,
  priority: 1,
});

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [processes, setProcesses] = useState(defaultProcesses);
  const [error, setError] = useState('');
  const [results, setResults] = useState(() => runAlgorithm('fcfs', defaultProcesses, 2));
  const [allResults, setAllResults] = useState(() => runAllAlgorithms(defaultProcesses, 2));
  const [playbackIndex, setPlaybackIndex] = useState(null);
  const [speed, setSpeed] = useState(700);
  const [isPlaying, setIsPlaying] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (playbackIndex !== null && playbackIndex >= results.segments.length - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPlaybackIndex((previous) => {
        if (previous === null) {
          return 0;
        }

        return Math.min(previous + 1, results.segments.length - 1);
      });
    }, speed);

    return () => window.clearTimeout(timer);
  }, [isPlaying, playbackIndex, results.segments.length, speed]);

  const colors = useMemo(() => buildColorMap(processes), [processes]);

  const handleProcessChange = (index, field, value) => {
    setProcesses((current) =>
      current.map((process, currentIndex) =>
        currentIndex === index
          ? {
              ...process,
              [field]: field === 'id' ? value : Number(value),
            }
          : process,
      ),
    );
  };

  const handleAddProcess = () => {
    setProcesses((current) => [...current, createEmptyProcess(current.length)]);
  };

  const handleRemoveProcess = (index) => {
    setProcesses((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleReset = () => {
    setProcesses(defaultProcesses);
    setTimeQuantum(2);
    setSelectedAlgorithm('fcfs');
    setError('');
    setResults(runAlgorithm('fcfs', defaultProcesses, 2));
    setAllResults(runAllAlgorithms(defaultProcesses, 2));
    setPlaybackIndex(null);
    setIsPlaying(false);
  };

  const handleRunSimulation = () => {
    const validationError = validateProcesses(processes, selectedAlgorithm, timeQuantum);

    if (validationError) {
      setError(validationError);
      return;
    }

    setResults(runAlgorithm(selectedAlgorithm, processes, timeQuantum));
    setAllResults(runAllAlgorithms(processes, timeQuantum));
    setPlaybackIndex(null);
    setIsPlaying(false);
    setError('');
  };

  const handleExportImage = async () => {
    if (!exportRef.current) {
      return;
    }

    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: null,
      scale: 2,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, 'cpu-scheduling-dashboard.png');
      }
    });
  };

  const handleExportPdf = async () => {
    if (!exportRef.current) {
      return;
    }

    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: '#020617',
      scale: 2,
    });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('cpu-scheduling-report.pdf');
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="glass rounded-[32px] p-6 shadow-glow">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.32em] text-teal-600 dark:text-teal-300">CPU Scheduling Visualizer</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Explore fairness, latency, and throughput with a live scheduling lab.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Simulate classic CPU scheduling algorithms, inspect every execution slice, compare averages side by side, and export the dashboard as an image or PDF.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((current) => !current)} />
              <button
                type="button"
                onClick={handleRunSimulation}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                <PlayCircle size={18} />
                Run Simulation
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
              >
                <RefreshCcw size={16} />
                Reset Data
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-3xl border border-rose-300 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ProcessForm
            processes={processes}
            selectedAlgorithm={selectedAlgorithm}
            timeQuantum={timeQuantum}
            onProcessChange={handleProcessChange}
            onAddProcess={handleAddProcess}
            onRemoveProcess={handleRemoveProcess}
            onQuantumChange={(value) => setTimeQuantum(Number(value))}
            onLoadSample={() => setProcesses(defaultProcesses)}
          />
          <AlgorithmSelector selectedAlgorithm={selectedAlgorithm} onChange={setSelectedAlgorithm} />
        </div>

        <div ref={exportRef} className="mt-8 space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Average Waiting Time" value={results.averageWaitingTime} accent="#14b8a6" />
            <MetricCard label="Average Turnaround Time" value={results.averageTurnaroundTime} accent="#f97316" />
            <MetricCard label="Execution Slices" value={results.segments.length} accent="#06b6d4" />
          </section>

          <GanttChart
            segments={results.segments}
            colors={colors}
            playbackIndex={playbackIndex}
            speed={speed}
            onSpeedChange={setSpeed}
            onStep={() =>
              setPlaybackIndex((current) => {
                if (current === null) {
                  return 0;
                }

                return Math.min(current + 1, results.segments.length - 1);
              })
            }
            onPlayToggle={() => {
              setPlaybackIndex((current) => current ?? 0);
              setIsPlaying((current) => !current);
            }}
            isPlaying={isPlaying}
          />

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ResultsTable results={results} />
            <InsightsPanel selectedAlgorithm={selectedAlgorithm} results={results} />
          </div>

          <ComparisonChart allResults={allResults} />
        </div>

        <section className="mt-8 glass rounded-[28px] p-6 shadow-glow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">Export</p>
              <h2 className="mt-2 text-2xl font-bold">Share the simulation</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportImage}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
              >
                <Download size={16} />
                Export PNG
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
