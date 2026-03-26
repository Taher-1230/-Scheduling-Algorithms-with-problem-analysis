export class Semaphore {
  constructor(name, initialCount = 1, maxCount = initialCount) {
    this.name = name;
    this.count = initialCount;
    this.maxCount = maxCount;
    this.queue = [];
    this.granted = [];
  }

  wait(processId) {
    if (this.granted.includes(processId)) {
      this.granted = this.granted.filter((id) => id !== processId);
      return { granted: true, wake: [] };
    }

    if (this.count > 0) {
      this.count -= 1;
      return { granted: true, wake: [] };
    }

    if (!this.queue.includes(processId)) {
      this.queue.push(processId);
    }

    return { granted: false, wake: [] };
  }

  signal() {
    if (this.queue.length) {
      const nextProcessId = this.queue.shift();
      this.granted.push(nextProcessId);
      return { wake: [nextProcessId] };
    }

    this.count = Math.min(this.maxCount, this.count + 1);
    return { wake: [] };
  }

  getSnapshot() {
    return {
      type: 'semaphore',
      name: this.name,
      count: this.count,
      queue: [...this.queue],
    };
  }
}

export class BinarySemaphore extends Semaphore {
  constructor(name, initialCount = 1) {
    super(name, initialCount, 1);
  }
}

export class ReaderWriterLock {
  constructor(name) {
    this.name = name;
    this.activeWriter = null;
    this.activeReaders = [];
    this.readerQueue = [];
    this.writerQueue = [];
  }

  acquireRead(processId) {
    if (this.activeReaders.includes(processId)) {
      return { granted: true, wake: [] };
    }

    if (this.activeWriter === null && this.writerQueue.length === 0) {
      if (!this.activeReaders.includes(processId)) {
        this.activeReaders.push(processId);
      }
      return { granted: true, wake: [] };
    }

    if (!this.readerQueue.includes(processId)) {
      this.readerQueue.push(processId);
    }

    return { granted: false, wake: [] };
  }

  releaseRead(processId) {
    this.activeReaders = this.activeReaders.filter((id) => id !== processId);

    if (this.activeReaders.length === 0 && this.writerQueue.length > 0) {
      const nextProcessId = this.writerQueue.shift();
      this.activeWriter = nextProcessId;
      return { wake: [nextProcessId] };
    }

    return { wake: [] };
  }

  acquireWrite(processId) {
    if (this.activeWriter === processId) {
      return { granted: true, wake: [] };
    }

    if (this.activeWriter === null && this.activeReaders.length === 0) {
      this.activeWriter = processId;
      return { granted: true, wake: [] };
    }

    if (!this.writerQueue.includes(processId)) {
      this.writerQueue.push(processId);
    }

    return { granted: false, wake: [] };
  }

  releaseWrite(processId) {
    if (this.activeWriter !== processId) {
      return { wake: [] };
    }

    this.activeWriter = null;

    if (this.writerQueue.length > 0) {
      const nextProcessId = this.writerQueue.shift();
      this.activeWriter = nextProcessId;
      return { wake: [nextProcessId] };
    }

    const wake = [...this.readerQueue];
    this.activeReaders = [...wake];
    this.readerQueue = [];
    return { wake };
  }

  getSnapshot() {
    return {
      type: 'reader-writer',
      name: this.name,
      activeWriter: this.activeWriter,
      activeReaders: [...this.activeReaders],
      readerQueue: [...this.readerQueue],
      writerQueue: [...this.writerQueue],
    };
  }
}
