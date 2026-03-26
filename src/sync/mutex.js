export class Mutex {
  constructor(name) {
    this.name = name;
    this.owner = null;
    this.queue = [];
  }

  acquire(processId) {
    if (this.owner === processId) {
      return { granted: true, wake: [] };
    }

    if (this.owner === null) {
      this.owner = processId;
      return { granted: true, wake: [] };
    }

    if (!this.queue.includes(processId)) {
      this.queue.push(processId);
    }

    return { granted: false, wake: [] };
  }

  release(processId) {
    if (this.owner !== processId) {
      return { wake: [] };
    }

    if (this.queue.length) {
      const nextProcessId = this.queue.shift();
      this.owner = nextProcessId;
      return { wake: [nextProcessId] };
    }

    this.owner = null;
    return { wake: [] };
  }

  getSnapshot() {
    return {
      type: 'mutex',
      name: this.name,
      owner: this.owner,
      queue: [...this.queue],
    };
  }
}
