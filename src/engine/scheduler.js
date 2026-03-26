const compareByArrival = (left, right) =>
  left.arrivalTime - right.arrivalTime || left.order - right.order;

export const ALGORITHMS = [
  { key: 'fcfs', label: 'FCFS' },
  { key: 'sjf-np', label: 'SJF Non-Preemptive' },
  { key: 'sjf-p', label: 'SJF Preemptive' },
  { key: 'rr', label: 'Round Robin' },
  { key: 'priority', label: 'Priority' },
];

export const isPreemptive = (algorithm) => algorithm === 'sjf-p' || algorithm === 'priority';

export const selectNextProcessId = ({ algorithm, timeQuantum, processMap, readyQueue }) => {
  if (!readyQueue.length) {
    return null;
  }

  if (algorithm === 'fcfs' || algorithm === 'rr') {
    return readyQueue[0];
  }

  if (algorithm === 'sjf-np' || algorithm === 'sjf-p') {
    return [...readyQueue]
      .sort((leftId, rightId) => {
        const left = processMap[leftId];
        const right = processMap[rightId];
        return (
          left.getRemainingCpuTime() - right.getRemainingCpuTime() ||
          compareByArrival(left, right)
        );
      })[0];
  }

  if (algorithm === 'priority') {
    return [...readyQueue]
      .sort((leftId, rightId) => {
        const left = processMap[leftId];
        const right = processMap[rightId];
        return left.priority - right.priority || compareByArrival(left, right);
      })[0];
  }

  return readyQueue[0];
};

export const shouldKeepRunning = ({ algorithm, currentProcessId, processMap }) => {
  if (!currentProcessId) {
    return false;
  }

  const process = processMap[currentProcessId];
  if (!process) {
    return false;
  }

  return algorithm === 'fcfs' || algorithm === 'sjf-np';
};

export const shouldRotateRoundRobin = ({ algorithm, currentSlice, timeQuantum }) =>
  algorithm === 'rr' && currentSlice >= Number(timeQuantum);
