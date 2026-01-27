/**
 * Simple in-memory request queue to limit concurrency.
 * Ensures we don't overwhelm the backend API or local process.
 */
export class RequestQueue {
  private concurrency: number;
  private activeCount: number;
  private queue: (() => void)[];

  /**
   * Creates a new RequestQueue
   * @param concurrency Maximum number of concurrent requests (default: 50)
   */
  constructor(concurrency: number = 50) {
    this.concurrency = concurrency;
    this.activeCount = 0;
    this.queue = [];
  }

  /**
   * Runs a task with concurrency limiting.
   * @param task A function that returns a promise
   * @returns The result of the task
   */
  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.concurrency) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.activeCount++;
    try {
      return await task();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
}
