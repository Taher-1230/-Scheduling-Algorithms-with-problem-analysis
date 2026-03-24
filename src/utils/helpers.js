export const PROCESS_COLORS = [
  '#06b6d4',
  '#22c55e',
  '#f97316',
  '#f43f5e',
  '#8b5cf6',
  '#eab308',
  '#14b8a6',
  '#ef4444',
];

export const roundNumber = (value) => Number(value.toFixed(2));

export const normalizeProcesses = (processes) =>
  processes.map((process, index) => ({
    ...process,
    id: process.id?.trim() || `P${index + 1}`,
    arrivalTime: Number(process.arrivalTime),
    burstTime: Number(process.burstTime),
    priority: Number(process.priority ?? 0),
    order: index,
  }));

export const buildColorMap = (processes) =>
  processes.reduce(
    (accumulator, process, index) => ({
      ...accumulator,
      [process.id]: PROCESS_COLORS[index % PROCESS_COLORS.length],
    }),
    { Idle: '#64748b' },
  );

export const isPriorityAlgorithm = (algorithmKey) => algorithmKey.includes('priority');

export const validateProcesses = (processes, selectedAlgorithm, timeQuantum) => {
  const normalized = normalizeProcesses(processes);

  for (const process of normalized) {
    if (!process.id) {
      return 'Every process needs a Process ID.';
    }

    if (Number.isNaN(process.arrivalTime) || process.arrivalTime < 0) {
      return `Arrival time for ${process.id} must be 0 or greater.`;
    }

    if (Number.isNaN(process.burstTime) || process.burstTime <= 0) {
      return `Burst time for ${process.id} must be greater than 0.`;
    }

    if (isPriorityAlgorithm(selectedAlgorithm) && (Number.isNaN(process.priority) || process.priority < 0)) {
      return `Priority for ${process.id} must be 0 or greater.`;
    }
  }

  if (selectedAlgorithm === 'rr' && (!timeQuantum || Number(timeQuantum) <= 0)) {
    return 'Time quantum must be greater than 0 for Round Robin.';
  }

  return '';
};

export const downloadBlob = (blob, fileName) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};
