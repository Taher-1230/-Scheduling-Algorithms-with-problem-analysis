const cpu = (duration, label) => ({ type: 'cpu', duration, label });
const lockMutex = (resource) => ({ type: 'lockMutex', resource });
const unlockMutex = (resource) => ({ type: 'unlockMutex', resource });
const waitSemaphore = (resource) => ({ type: 'waitSemaphore', resource });
const signalSemaphore = (resource) => ({ type: 'signalSemaphore', resource });
const readLock = (resource) => ({ type: 'readLock', resource });
const readUnlock = (resource) => ({ type: 'readUnlock', resource });
const writeLock = (resource) => ({ type: 'writeLock', resource });
const writeUnlock = (resource) => ({ type: 'writeUnlock', resource });
const produce = () => ({ type: 'produce' });
const consume = () => ({ type: 'consume' });
const readShared = (key, target) => ({ type: 'readShared', key, target });
const incrementLocal = (target) => ({ type: 'incrementLocal', target });
const writeShared = (key, source) => ({ type: 'writeShared', key, source });

export const defaultSchedulingProcesses = [
  { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
  { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
  { id: 'P3', arrivalTime: 3, burstTime: 5, priority: 3 },
  { id: 'P4', arrivalTime: 5, burstTime: 2, priority: 2 },
];

export const createSchedulingScenario = (processes) => ({
  name: 'CPU Scheduling Lab',
  key: 'scheduling',
  description: 'Pure scheduling workload with dynamic arrivals and no resource blocking.',
  resources: {},
  sharedState: {},
  processes: processes.map((process) => ({
    id: process.id,
    arrivalTime: Number(process.arrivalTime),
    priority: Number(process.priority),
    instructions: [cpu(Number(process.burstTime), `Burst ${process.burstTime}`)],
  })),
});

export const createProducerConsumerScenario = () => ({
  name: 'Producer Consumer',
  key: 'producer-consumer',
  description: 'Semaphore-controlled bounded buffer with producers and consumers blocking on full or empty states.',
  resources: {
    bufferMutex: { type: 'mutex', name: 'Buffer Mutex' },
    emptySlots: { type: 'counting-semaphore', name: 'Empty Slots', initialCount: 3, maxCount: 3 },
    fullSlots: { type: 'counting-semaphore', name: 'Full Slots', initialCount: 0, maxCount: 3 },
  },
  sharedState: {
    buffer: [],
    bufferLimit: 3,
  },
  processes: [
    {
      id: 'Producer-1',
      arrivalTime: 0,
      priority: 1,
      instructions: [
        cpu(1, 'Produce request'),
        waitSemaphore('emptySlots'),
        lockMutex('bufferMutex'),
        produce(),
        unlockMutex('bufferMutex'),
        signalSemaphore('fullSlots'),
        cpu(1, 'Prepare next item'),
        waitSemaphore('emptySlots'),
        lockMutex('bufferMutex'),
        produce(),
        unlockMutex('bufferMutex'),
        signalSemaphore('fullSlots'),
      ],
    },
    {
      id: 'Producer-2',
      arrivalTime: 1,
      priority: 2,
      instructions: [
        cpu(1, 'Produce request'),
        waitSemaphore('emptySlots'),
        lockMutex('bufferMutex'),
        produce(),
        unlockMutex('bufferMutex'),
        signalSemaphore('fullSlots'),
      ],
    },
    {
      id: 'Consumer-1',
      arrivalTime: 0,
      priority: 1,
      instructions: [
        waitSemaphore('fullSlots'),
        lockMutex('bufferMutex'),
        consume(),
        unlockMutex('bufferMutex'),
        signalSemaphore('emptySlots'),
        cpu(2, 'Process item'),
        waitSemaphore('fullSlots'),
        lockMutex('bufferMutex'),
        consume(),
        unlockMutex('bufferMutex'),
        signalSemaphore('emptySlots'),
      ],
    },
    {
      id: 'Consumer-2',
      arrivalTime: 2,
      priority: 2,
      instructions: [
        waitSemaphore('fullSlots'),
        lockMutex('bufferMutex'),
        consume(),
        unlockMutex('bufferMutex'),
        signalSemaphore('emptySlots'),
        cpu(1, 'Process item'),
      ],
    },
  ],
});

export const createReadersWritersScenario = () => ({
  name: 'Readers Writers',
  key: 'readers-writers',
  description: 'Readers can share access while writers need exclusive access to the same resource.',
  resources: {
    library: { type: 'reader-writer-lock', name: 'Shared Database' },
  },
  sharedState: {
    readLog: [],
  },
  processes: [
    {
      id: 'Reader-1',
      arrivalTime: 0,
      priority: 2,
      instructions: [readLock('library'), cpu(2, 'Read'), readUnlock('library'), cpu(1, 'Think')],
    },
    {
      id: 'Reader-2',
      arrivalTime: 1,
      priority: 2,
      instructions: [readLock('library'), cpu(2, 'Read'), readUnlock('library')],
    },
    {
      id: 'Writer-1',
      arrivalTime: 2,
      priority: 1,
      instructions: [writeLock('library'), cpu(3, 'Write'), writeUnlock('library')],
    },
    {
      id: 'Reader-3',
      arrivalTime: 3,
      priority: 3,
      instructions: [readLock('library'), cpu(1, 'Read'), readUnlock('library')],
    },
  ],
});

export const createDiningPhilosophersScenario = () => ({
  name: 'Dining Philosophers',
  key: 'dining-philosophers',
  description: 'Forks are acquired in resource order to avoid circular wait and deadlock.',
  resources: {
    fork0: { type: 'mutex', name: 'Fork 0' },
    fork1: { type: 'mutex', name: 'Fork 1' },
    fork2: { type: 'mutex', name: 'Fork 2' },
    fork3: { type: 'mutex', name: 'Fork 3' },
    fork4: { type: 'mutex', name: 'Fork 4' },
  },
  sharedState: {},
  processes: Array.from({ length: 5 }, (_, index) => {
    const left = `fork${index}`;
    const right = `fork${(index + 1) % 5}`;
    const ordered = [left, right].sort();

    return {
      id: `Phil-${index + 1}`,
      arrivalTime: index,
      priority: 2,
      instructions: [
        cpu(1, 'Think'),
        lockMutex(ordered[0]),
        lockMutex(ordered[1]),
        cpu(2, 'Eat'),
        unlockMutex(ordered[1]),
        unlockMutex(ordered[0]),
      ],
    };
  }),
});

const createCounterInstructions = (safe) => {
  const steps = [];

  for (let iteration = 0; iteration < 3; iteration += 1) {
    if (safe) {
      steps.push(lockMutex('criticalMutex'));
    }
    steps.push(readShared('counter', 'temp'));
    steps.push(cpu(1, 'Read value'));
    steps.push(incrementLocal('temp'));
    steps.push(cpu(1, 'Compute new value'));
    steps.push(writeShared('counter', 'temp'));
    steps.push(cpu(1, 'Commit write'));
    if (safe) {
      steps.push(unlockMutex('criticalMutex'));
    }
  }

  return steps;
};

export const createCriticalSectionScenario = (safe) => ({
  name: safe ? 'Critical Section With Mutex' : 'Critical Section Without Mutex',
  key: safe ? 'critical-safe' : 'critical-unsafe',
  description: safe
    ? 'A mutex serializes access to the critical section and protects the shared counter.'
    : 'No mutex is used, so interleaving reads and writes can create a race condition.',
  resources: safe
    ? {
        criticalMutex: { type: 'mutex', name: 'Critical Mutex' },
      }
    : {},
  sharedState: {
    counter: 0,
    counterHistory: [],
  },
  processes: [
    {
      id: 'Worker-A',
      arrivalTime: 0,
      priority: 1,
      instructions: createCounterInstructions(safe),
    },
    {
      id: 'Worker-B',
      arrivalTime: 1,
      priority: 1,
      instructions: createCounterInstructions(safe),
    },
  ],
});

export const scenarioCatalog = [
  {
    key: 'scheduling',
    label: 'Scheduling Only',
    description: 'Pure scheduling workload with dynamic arrivals and no resource blocking.',
    build: createSchedulingScenario,
  },
  {
    key: 'producer-consumer',
    label: 'Producer Consumer',
    description: 'Semaphore-controlled bounded buffer with producers and consumers blocking on full or empty states.',
    build: createProducerConsumerScenario,
  },
  {
    key: 'readers-writers',
    label: 'Readers Writers',
    description: 'Readers can share access while writers need exclusive access to the same resource.',
    build: createReadersWritersScenario,
  },
  {
    key: 'dining-philosophers',
    label: 'Dining Philosophers',
    description: 'Forks are acquired in resource order to avoid circular wait and deadlock.',
    build: createDiningPhilosophersScenario,
  },
  {
    key: 'critical-unsafe',
    label: 'Critical Section (Race)',
    description: 'No mutex protects the counter so reads and writes interleave and show races.',
    build: () => createCriticalSectionScenario(false),
  },
  {
    key: 'critical-safe',
    label: 'Critical Section (Mutex)',
    description: 'A mutex serializes the critical section and keeps the shared counter consistent.',
    build: () => createCriticalSectionScenario(true),
  },
];
