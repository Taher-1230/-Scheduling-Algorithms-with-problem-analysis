import { ALGORITHMS, isPreemptive, selectNextProcessId, shouldKeepRunning, shouldRotateRoundRobin } from './scheduler';
import { ProcessModel, PROCESS_STATES } from './processModel';
import { Mutex } from '../sync/mutex';
import { BinarySemaphore, ReaderWriterLock, Semaphore } from '../sync/semaphore';

const MAX_TICKS = 500;

const cloneSharedState = (sharedState) => JSON.parse(JSON.stringify(sharedState ?? {}));

const createResource = (definition) => {
  if (definition.type === 'mutex') {
    return new Mutex(definition.name);
  }

  if (definition.type === 'binary-semaphore') {
    return new BinarySemaphore(definition.name, definition.initialCount ?? 1);
  }

  if (definition.type === 'counting-semaphore') {
    return new Semaphore(definition.name, definition.initialCount ?? 0, definition.maxCount ?? definition.initialCount ?? 0);
  }

  if (definition.type === 'reader-writer-lock') {
    return new ReaderWriterLock(definition.name);
  }

  throw new Error(`Unknown resource type: ${definition.type}`);
};

export class SimulationEngine {
  constructor(config) {
    this.name = config.name;
    this.algorithm = config.algorithm ?? 'fcfs';
    this.timeQuantum = Number(config.timeQuantum ?? 2);
    this.time = 0;
    this.readyQueue = [];
    this.waitingQueue = [];
    this.currentProcessId = null;
    this.currentSlice = 0;
    this.gantt = [];
    this.events = [];
    this.finished = false;
    this.sharedState = cloneSharedState(config.sharedState);
    this.resourceMap = Object.fromEntries(
      Object.entries(config.resources ?? {}).map(([key, definition]) => [key, createResource(definition)]),
    );
    this.processes = (config.processes ?? []).map((process, index) => new ProcessModel(process, index));
    this.processMap = Object.fromEntries(this.processes.map((process) => [process.id, process]));
    this.algorithmCatalog = ALGORITHMS;
  }

  getProcessById(processId) {
    return this.processMap[processId];
  }

  addToReady(processId) {
    if (!processId || this.readyQueue.includes(processId)) {
      return;
    }

    this.readyQueue.push(processId);
  }

  removeFromReady(processId) {
    this.readyQueue = this.readyQueue.filter((id) => id !== processId);
  }

  addToWaiting(processId) {
    if (!processId || this.waitingQueue.includes(processId)) {
      return;
    }

    this.waitingQueue.push(processId);
  }

  removeFromWaiting(processId) {
    this.waitingQueue = this.waitingQueue.filter((id) => id !== processId);
  }

  wakeProcesses(processIds) {
    for (const processId of processIds) {
      const process = this.getProcessById(processId);
      if (!process || process.state === PROCESS_STATES.TERMINATED) {
        continue;
      }

      process.state = PROCESS_STATES.READY;
      process.blockedReason = '';
      this.removeFromWaiting(processId);
      this.addToReady(processId);
    }
  }

  handleArrivals() {
    for (const process of this.processes) {
      if (process.state === PROCESS_STATES.NEW && process.arrivalTime <= this.time) {
        process.state = PROCESS_STATES.READY;
        this.addToReady(process.id);
      }
    }
  }

  schedule() {
    if (
      shouldKeepRunning({
        algorithm: this.algorithm,
        currentProcessId: this.currentProcessId,
        processMap: this.processMap,
      })
    ) {
      return;
    }

    if (this.currentProcessId && isPreemptive(this.algorithm)) {
      const currentProcess = this.getProcessById(this.currentProcessId);
      if (currentProcess && currentProcess.state === PROCESS_STATES.RUNNING) {
        currentProcess.state = PROCESS_STATES.READY;
        this.addToReady(currentProcess.id);
      }
      this.currentProcessId = null;
    }

    const nextProcessId = selectNextProcessId({
      algorithm: this.algorithm,
      timeQuantum: this.timeQuantum,
      processMap: this.processMap,
      readyQueue: this.readyQueue,
    });

    if (!nextProcessId) {
      return;
    }

    this.removeFromReady(nextProcessId);
    this.currentProcessId = nextProcessId;
    this.currentSlice = 0;

    const nextProcess = this.getProcessById(nextProcessId);
    nextProcess.state = PROCESS_STATES.RUNNING;
  }

  applyResourceWake(result) {
    if (result?.wake?.length) {
      this.wakeProcesses(result.wake);
    }
  }

  blockProcess(process, reason) {
    process.state = PROCESS_STATES.WAITING;
    process.blockedReason = reason;
    this.currentProcessId = null;
    this.currentSlice = 0;
    this.addToWaiting(process.id);
  }

  terminateProcess(process, completedAt) {
    process.state = PROCESS_STATES.TERMINATED;
    process.completionTime = completedAt;
    process.blockedReason = '';
    this.currentProcessId = null;
    this.currentSlice = 0;
  }

  executeZeroTimeInstruction(process, instruction) {
    if (instruction.type === 'lockMutex') {
      const result = this.resourceMap[instruction.resource].acquire(process.id);
      if (!result.granted) {
        this.blockProcess(process, `Waiting for ${instruction.resource}`);
        return false;
      }
      process.advance();
      return true;
    }

    if (instruction.type === 'unlockMutex') {
      const result = this.resourceMap[instruction.resource].release(process.id);
      this.applyResourceWake(result);
      process.advance();
      return true;
    }

    if (instruction.type === 'waitSemaphore') {
      const result = this.resourceMap[instruction.resource].wait(process.id);
      if (!result.granted) {
        this.blockProcess(process, `Blocked on ${instruction.resource}`);
        return false;
      }
      process.advance();
      return true;
    }

    if (instruction.type === 'signalSemaphore') {
      const result = this.resourceMap[instruction.resource].signal();
      this.applyResourceWake(result);
      process.advance();
      return true;
    }

    if (instruction.type === 'readLock') {
      const result = this.resourceMap[instruction.resource].acquireRead(process.id);
      if (!result.granted) {
        this.blockProcess(process, `Reader blocked by ${instruction.resource}`);
        return false;
      }
      process.advance();
      return true;
    }

    if (instruction.type === 'readUnlock') {
      const result = this.resourceMap[instruction.resource].releaseRead(process.id);
      this.applyResourceWake(result);
      process.advance();
      return true;
    }

    if (instruction.type === 'writeLock') {
      const result = this.resourceMap[instruction.resource].acquireWrite(process.id);
      if (!result.granted) {
        this.blockProcess(process, `Writer blocked by ${instruction.resource}`);
        return false;
      }
      process.advance();
      return true;
    }

    if (instruction.type === 'writeUnlock') {
      const result = this.resourceMap[instruction.resource].releaseWrite(process.id);
      this.applyResourceWake(result);
      process.advance();
      return true;
    }

    if (instruction.type === 'produce') {
      this.sharedState.buffer = this.sharedState.buffer ?? [];
      this.sharedState.buffer.push({
        by: process.id,
        at: this.time,
      });
      process.advance();
      return true;
    }

    if (instruction.type === 'consume') {
      this.sharedState.buffer = this.sharedState.buffer ?? [];
      this.sharedState.buffer.shift();
      process.advance();
      return true;
    }

    if (instruction.type === 'readShared') {
      process.local[instruction.target] = this.sharedState[instruction.key];
      process.advance();
      return true;
    }

    if (instruction.type === 'incrementLocal') {
      process.local[instruction.target] = Number(process.local[instruction.target] ?? 0) + 1;
      process.advance();
      return true;
    }

    if (instruction.type === 'writeShared') {
      this.sharedState[instruction.key] = process.local[instruction.source];
      this.sharedState.counterHistory = this.sharedState.counterHistory ?? [];
      this.sharedState.counterHistory.push({
        by: process.id,
        value: this.sharedState[instruction.key],
        at: this.time,
      });
      process.advance();
      return true;
    }

    process.advance();
    return true;
  }

  executeProcess(process) {
    let cpuConsumed = false;

    while (true) {
      const instruction = process.getCurrentInstruction();
      if (!instruction) {
        this.terminateProcess(process, this.time + (cpuConsumed ? 1 : 0));
        return cpuConsumed ? process.id : 'Idle';
      }

      if (instruction.type === 'cpu') {
        if (cpuConsumed) {
          return process.id;
        }

        instruction.remaining -= 1;
        process.executedCpuTime += 1;
        cpuConsumed = true;
        this.currentSlice += 1;

        if (instruction.remaining <= 0) {
          process.advance();
          continue;
        }

        return process.id;
      }

      const keepRunning = this.executeZeroTimeInstruction(process, instruction);
      if (!keepRunning) {
        return cpuConsumed ? process.id : 'Idle';
      }
    }
  }

  finalizeRoundRobin() {
    if (!this.currentProcessId) {
      return;
    }

    const currentProcess = this.getProcessById(this.currentProcessId);
    if (!currentProcess || currentProcess.state !== PROCESS_STATES.RUNNING) {
      return;
    }

    if (
      shouldRotateRoundRobin({
        algorithm: this.algorithm,
        currentSlice: this.currentSlice,
        timeQuantum: this.timeQuantum,
      }) &&
      this.readyQueue.length > 0
    ) {
      currentProcess.state = PROCESS_STATES.READY;
      this.addToReady(currentProcess.id);
      this.currentProcessId = null;
      this.currentSlice = 0;
    }
  }

  updateWaitingTimes() {
    for (const processId of this.readyQueue) {
      const process = this.getProcessById(processId);
      if (process) {
        process.waitingTime += 1;
      }
    }
  }

  tick() {
    if (this.finished) {
      return this.getSnapshot();
    }

    this.handleArrivals();
    this.schedule();

    let executedProcessId = 'Idle';
    if (this.currentProcessId) {
      const currentProcess = this.getProcessById(this.currentProcessId);
      executedProcessId = this.executeProcess(currentProcess);
    }

    this.updateWaitingTimes();
    this.finalizeRoundRobin();
    this.gantt.push({
      time: this.time,
      processId: executedProcessId,
    });

    if (this.currentProcessId) {
      const currentProcess = this.getProcessById(this.currentProcessId);
      if (currentProcess && currentProcess.state === PROCESS_STATES.RUNNING) {
        currentProcess.state = PROCESS_STATES.RUNNING;
      }
    }

    this.time += 1;

    if (
      this.processes.every((process) => process.state === PROCESS_STATES.TERMINATED) ||
      this.time >= MAX_TICKS
    ) {
      this.finished = true;
    }

    return this.getSnapshot();
  }

  runToCompletion() {
    while (!this.finished) {
      this.tick();
    }

    return this.getSnapshot();
  }

  getMetrics() {
    const rows = this.processes.map((process) => {
      const turnaroundTime =
        process.completionTime === null ? null : process.completionTime - process.arrivalTime;
      const burstTime = process.getTotalBurstTime();
      return {
        id: process.id,
        arrivalTime: process.arrivalTime,
        priority: process.priority,
        state: process.state,
        burstTime,
        remainingCpuTime: process.getRemainingCpuTime(),
        completionTime: process.completionTime,
        turnaroundTime,
        waitingTime: process.waitingTime,
        blockedReason: process.blockedReason,
      };
    });

    const terminatedRows = rows.filter((row) => row.completionTime !== null);
    const averageWaitingTime =
      terminatedRows.length > 0
        ? Number(
            (
              terminatedRows.reduce((total, row) => total + row.waitingTime, 0) /
              terminatedRows.length
            ).toFixed(2),
          )
        : 0;
    const averageTurnaroundTime =
      terminatedRows.length > 0
        ? Number(
            (
              terminatedRows.reduce((total, row) => total + row.turnaroundTime, 0) /
              terminatedRows.length
            ).toFixed(2),
          )
        : 0;

    return { rows, averageWaitingTime, averageTurnaroundTime };
  }

  getSnapshot() {
    return {
      name: this.name,
      algorithm: this.algorithm,
      time: this.time,
      readyQueue: [...this.readyQueue],
      waitingQueue: [...this.waitingQueue],
      currentProcessId: this.currentProcessId,
      gantt: [...this.gantt],
      processes: this.getMetrics().rows,
      metrics: this.getMetrics(),
      sharedState: cloneSharedState(this.sharedState),
      resources: Object.fromEntries(
        Object.entries(this.resourceMap).map(([key, resource]) => [key, resource.getSnapshot()]),
      ),
      finished: this.finished,
    };
  }
}

export const buildEngine = (scenarioConfig, schedulerConfig) =>
  new SimulationEngine({
    ...scenarioConfig,
    algorithm: schedulerConfig.algorithm,
    timeQuantum: schedulerConfig.timeQuantum,
  });

export const runScenarioComparison = (scenarioConfig, schedulerConfig) =>
  Object.fromEntries(
    ALGORITHMS.map((algorithm) => {
      const engine = buildEngine(scenarioConfig, {
        ...schedulerConfig,
        algorithm: algorithm.key,
      });
      const snapshot = engine.runToCompletion();
      return [algorithm.key, snapshot.metrics];
    }),
  );
