const CPU_TYPES = new Set(['cpu']);

export const PROCESS_STATES = {
  NEW: 'NEW',
  READY: 'READY',
  RUNNING: 'RUNNING',
  WAITING: 'WAITING',
  TERMINATED: 'TERMINATED',
};

export class ProcessModel {
  constructor(definition, order = 0) {
    this.id = definition.id;
    this.arrivalTime = Number(definition.arrivalTime ?? 0);
    this.priority = Number(definition.priority ?? 0);
    this.order = order;
    this.state = PROCESS_STATES.NEW;
    this.instructions = (definition.instructions ?? []).map((instruction, index) => ({
      ...instruction,
      key: `${definition.id}-${index}`,
      remaining: instruction.type === 'cpu' ? Number(instruction.duration ?? 0) : undefined,
    }));
    this.pointer = 0;
    this.waitingTime = 0;
    this.completionTime = null;
    this.blockedReason = '';
    this.local = {};
    this.executedCpuTime = 0;
  }

  getCurrentInstruction() {
    return this.instructions[this.pointer] ?? null;
  }

  advance() {
    this.pointer += 1;
  }

  isTerminated() {
    return this.pointer >= this.instructions.length;
  }

  getRemainingCpuTime() {
    return this.instructions.slice(this.pointer).reduce((total, instruction) => {
      if (!CPU_TYPES.has(instruction.type)) {
        return total;
      }

      return total + Number(instruction.remaining ?? instruction.duration ?? 0);
    }, 0);
  }

  getTotalBurstTime() {
    return this.instructions.reduce((total, instruction) => {
      if (!CPU_TYPES.has(instruction.type)) {
        return total;
      }

      return total + Number(instruction.duration ?? 0);
    }, 0);
  }

  getTurnaroundTime() {
    if (this.completionTime === null) {
      return null;
    }

    return this.completionTime - this.arrivalTime;
  }
}
