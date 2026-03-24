import { normalizeProcesses, roundNumber } from './helpers';

const compareByArrival = (left, right) =>
  left.arrivalTime - right.arrivalTime || left.order - right.order;

const compressSegments = (segments) => {
  const compressed = [];

  for (const segment of segments) {
    const previous = compressed[compressed.length - 1];

    if (previous && previous.processId === segment.processId && previous.end === segment.start) {
      previous.end = segment.end;
      previous.duration = previous.end - previous.start;
    } else {
      compressed.push({ ...segment });
    }
  }

  return compressed;
};

const finalizeMetrics = (baseProcesses, completionTimes, segments) => {
  const rows = baseProcesses
    .map((process) => {
      const completionTime = completionTimes[process.id];
      const turnaroundTime = completionTime - process.arrivalTime;
      const waitingTime = turnaroundTime - process.burstTime;

      return {
        id: process.id,
        arrivalTime: process.arrivalTime,
        burstTime: process.burstTime,
        priority: process.priority,
        completionTime,
        turnaroundTime,
        waitingTime,
      };
    })
    .sort((left, right) => left.arrivalTime - right.arrivalTime || left.id.localeCompare(right.id));

  const totalWaiting = rows.reduce((sum, row) => sum + row.waitingTime, 0);
  const totalTurnaround = rows.reduce((sum, row) => sum + row.turnaroundTime, 0);

  return {
    rows,
    segments: compressSegments(segments),
    averageWaitingTime: roundNumber(totalWaiting / rows.length),
    averageTurnaroundTime: roundNumber(totalTurnaround / rows.length),
  };
};

const addIdleIfNeeded = (segments, currentTime, nextTime) => {
  if (nextTime > currentTime) {
    segments.push({
      processId: 'Idle',
      start: currentTime,
      end: nextTime,
      duration: nextTime - currentTime,
    });
  }
};

const pickReadyProcess = (ready, compareFn) => {
  ready.sort(compareFn);
  return ready[0];
};

export const runFCFS = (processes) => {
  const baseProcesses = normalizeProcesses(processes).sort(compareByArrival);
  const completionTimes = {};
  const segments = [];
  let currentTime = 0;

  for (const process of baseProcesses) {
    if (currentTime < process.arrivalTime) {
      addIdleIfNeeded(segments, currentTime, process.arrivalTime);
      currentTime = process.arrivalTime;
    }

    segments.push({
      processId: process.id,
      start: currentTime,
      end: currentTime + process.burstTime,
      duration: process.burstTime,
    });

    currentTime += process.burstTime;
    completionTimes[process.id] = currentTime;
  }

  return finalizeMetrics(baseProcesses, completionTimes, segments);
};

export const runSJFNonPreemptive = (processes) => {
  const baseProcesses = normalizeProcesses(processes);
  const pending = [...baseProcesses].sort(compareByArrival);
  const completionTimes = {};
  const segments = [];
  const ready = [];
  let currentTime = 0;

  while (pending.length || ready.length) {
    while (pending.length && pending[0].arrivalTime <= currentTime) {
      ready.push(pending.shift());
    }

    if (!ready.length) {
      const nextArrival = pending[0].arrivalTime;
      addIdleIfNeeded(segments, currentTime, nextArrival);
      currentTime = nextArrival;
      continue;
    }

    const process = pickReadyProcess(
      ready,
      (left, right) =>
        left.burstTime - right.burstTime ||
        left.arrivalTime - right.arrivalTime ||
        left.order - right.order,
    );

    ready.splice(ready.indexOf(process), 1);
    segments.push({
      processId: process.id,
      start: currentTime,
      end: currentTime + process.burstTime,
      duration: process.burstTime,
    });

    currentTime += process.burstTime;
    completionTimes[process.id] = currentTime;
  }

  return finalizeMetrics(baseProcesses, completionTimes, segments);
};

const runUnitPreemptive = (processes, compareFn) => {
  const baseProcesses = normalizeProcesses(processes);
  const pending = [...baseProcesses].sort(compareByArrival);
  const completionTimes = {};
  const segments = [];
  const ready = [];
  const remaining = Object.fromEntries(baseProcesses.map((process) => [process.id, process.burstTime]));
  let completed = 0;
  let currentTime = 0;

  while (completed < baseProcesses.length) {
    while (pending.length && pending[0].arrivalTime <= currentTime) {
      ready.push(pending.shift());
    }

    if (!ready.length) {
      const nextArrival = pending[0].arrivalTime;
      addIdleIfNeeded(segments, currentTime, nextArrival);
      currentTime = nextArrival;
      continue;
    }

    const process = pickReadyProcess(ready, (left, right) =>
      compareFn(left, right, remaining) || left.arrivalTime - right.arrivalTime || left.order - right.order,
    );

    segments.push({
      processId: process.id,
      start: currentTime,
      end: currentTime + 1,
      duration: 1,
    });

    remaining[process.id] -= 1;
    currentTime += 1;

    if (remaining[process.id] === 0) {
      completionTimes[process.id] = currentTime;
      ready.splice(ready.indexOf(process), 1);
      completed += 1;
    }
  }

  return finalizeMetrics(baseProcesses, completionTimes, segments);
};

export const runSJFPreemptive = (processes) =>
  runUnitPreemptive(processes, (left, right, remaining) => remaining[left.id] - remaining[right.id]);

export const runPriorityNonPreemptive = (processes) => {
  const baseProcesses = normalizeProcesses(processes);
  const pending = [...baseProcesses].sort(compareByArrival);
  const completionTimes = {};
  const segments = [];
  const ready = [];
  let currentTime = 0;

  while (pending.length || ready.length) {
    while (pending.length && pending[0].arrivalTime <= currentTime) {
      ready.push(pending.shift());
    }

    if (!ready.length) {
      const nextArrival = pending[0].arrivalTime;
      addIdleIfNeeded(segments, currentTime, nextArrival);
      currentTime = nextArrival;
      continue;
    }

    const process = pickReadyProcess(
      ready,
      (left, right) =>
        left.priority - right.priority ||
        left.arrivalTime - right.arrivalTime ||
        left.order - right.order,
    );

    ready.splice(ready.indexOf(process), 1);
    segments.push({
      processId: process.id,
      start: currentTime,
      end: currentTime + process.burstTime,
      duration: process.burstTime,
    });

    currentTime += process.burstTime;
    completionTimes[process.id] = currentTime;
  }

  return finalizeMetrics(baseProcesses, completionTimes, segments);
};

export const runPriorityPreemptive = (processes) =>
  runUnitPreemptive(processes, (left, right) => left.priority - right.priority);

export const runRoundRobin = (processes, timeQuantum) => {
  const quantum = Number(timeQuantum);
  const baseProcesses = normalizeProcesses(processes);
  const pending = [...baseProcesses].sort(compareByArrival);
  const completionTimes = {};
  const segments = [];
  const ready = [];
  const remaining = Object.fromEntries(baseProcesses.map((process) => [process.id, process.burstTime]));
  let currentTime = 0;

  while (pending.length || ready.length) {
    while (pending.length && pending[0].arrivalTime <= currentTime) {
      ready.push(pending.shift());
    }

    if (!ready.length) {
      const nextArrival = pending[0].arrivalTime;
      addIdleIfNeeded(segments, currentTime, nextArrival);
      currentTime = nextArrival;
      continue;
    }

    const process = ready.shift();
    const slice = Math.min(quantum, remaining[process.id]);
    const start = currentTime;
    currentTime += slice;

    segments.push({
      processId: process.id,
      start,
      end: currentTime,
      duration: slice,
    });

    remaining[process.id] -= slice;

    while (pending.length && pending[0].arrivalTime <= currentTime) {
      ready.push(pending.shift());
    }

    if (remaining[process.id] > 0) {
      ready.push(process);
    } else {
      completionTimes[process.id] = currentTime;
    }
  }

  return finalizeMetrics(baseProcesses, completionTimes, segments);
};

export const runAlgorithm = (algorithmKey, processes, timeQuantum) => {
  switch (algorithmKey) {
    case 'fcfs':
      return runFCFS(processes);
    case 'sjf-np':
      return runSJFNonPreemptive(processes);
    case 'sjf-p':
      return runSJFPreemptive(processes);
    case 'rr':
      return runRoundRobin(processes, timeQuantum);
    case 'priority-np':
      return runPriorityNonPreemptive(processes);
    case 'priority-p':
      return runPriorityPreemptive(processes);
    default:
      return runFCFS(processes);
  }
};

export const runAllAlgorithms = (processes, timeQuantum) => ({
  fcfs: runFCFS(processes),
  'sjf-np': runSJFNonPreemptive(processes),
  'sjf-p': runSJFPreemptive(processes),
  rr: runRoundRobin(processes, timeQuantum),
  'priority-np': runPriorityNonPreemptive(processes),
  'priority-p': runPriorityPreemptive(processes),
});
