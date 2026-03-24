# CPU Scheduling Visualizer

A modern React dashboard for exploring classic CPU scheduling algorithms with interactive process inputs, animated Gantt charts, and algorithm comparisons.

## Tech Stack

- React with functional components and hooks
- Tailwind CSS for styling
- Recharts for comparison graphs
- Pure frontend scheduling logic

## Features

- Dynamic process editor with add/remove controls
- FCFS, SJF Non-Preemptive, SJF Preemptive (SRTF), Round Robin, Priority Non-Preemptive, and Priority Preemptive
- Per-process CT, TAT, and WT calculations
- Idle CPU handling and stable tie-breaking for same-arrival processes
- Interactive Gantt chart with play/pause, step mode, and speed control
- Comparison bar chart for average WT and TAT across all algorithms
- Dark and light themes
- Export dashboard as PNG or PDF

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Project Structure

```text
src/
  components/
  data/
  utils/
  App.jsx
  main.jsx
```

## Scheduling Notes

- `CT = Completion Time`
- `TAT = CT - AT`
- `WT = TAT - BT`
- Lower priority numbers are treated as higher priority
- Tie-breakers preserve earlier arrival time, then original input order

## Bonus Support

- Step-by-step execution playback
- Animation speed control
- PNG and PDF export
