# Operating System Simulator Web App

A React-based OS simulator that runs a real discrete time-step engine instead of a static animation.

## What It Simulates

- Dynamic CPU scheduling with `FCFS`, `SJF Non-Preemptive`, `SJF Preemptive`, `Round Robin`, and `Priority`
- Process states: `NEW`, `READY`, `RUNNING`, `WAITING`, and `TERMINATED`
- Ready queue and waiting queue updates on every tick
- Pause, resume, reset, and single-step execution
- Real synchronization blocking and wake-up behavior

## Synchronization Modules

- Producer Consumer with bounded buffer, mutex, and counting semaphores
- Readers Writers with shared-reader and exclusive-writer behavior
- Dining Philosophers with resource ordering to prevent deadlock
- Critical Section with and without a mutex to demonstrate race conditions

## Project Structure

```text
src/
  components/
    Controls.jsx
    GanttChart.jsx
    QueueView.jsx
  data/
    scenarios.js
  engine/
    processModel.js
    scheduler.js
    simulationEngine.js
  sync/
    mutex.js
    semaphore.js
```

## Run Locally

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```
