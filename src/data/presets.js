export const defaultProcesses = [
  { id: 'P1', arrivalTime: 0, burstTime: 7, priority: 2 },
  { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
  { id: 'P3', arrivalTime: 2, burstTime: 6, priority: 3 },
  { id: 'P4', arrivalTime: 4, burstTime: 5, priority: 2 },
];

export const algorithmOptions = [
  { key: 'fcfs', label: 'FCFS' },
  { key: 'sjf-np', label: 'SJF Non-Preemptive' },
  { key: 'sjf-p', label: 'SJF Preemptive (SRTF)' },
  { key: 'rr', label: 'Round Robin' },
  { key: 'priority-np', label: 'Priority Non-Preemptive' },
  { key: 'priority-p', label: 'Priority Preemptive' },
];
