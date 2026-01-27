import { RequestQueue } from '../../src/utils/queue';

describe('RequestQueue', () => {
  let queue: RequestQueue;

  beforeEach(() => {
    // Create new queue for each test
    // We'll expose a static reset or just instantiation based on implementation
    queue = new RequestQueue(50);
  });

  it('should run a single task immediately', async () => {
    const task = jest.fn().mockResolvedValue('result');
    const result = await queue.run(task);
    expect(result).toBe('result');
    expect(task).toHaveBeenCalled();
  });

  it('should run tasks concurrently up to limit', async () => {
    // Create a special queue with low limit for testing
    queue = new RequestQueue(5);

    let activeCount = 0;
    let maxActive = 0;

    const task = async () => {
      activeCount++;
      maxActive = Math.max(maxActive, activeCount);
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 10));
      activeCount--;
      return 'done';
    };

    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(queue.run(task));
    }

    await Promise.all(promises);
    expect(maxActive).toBeLessThan(6); // Should not exceed 5
    expect(maxActive).toBeGreaterThan(0);
  });

  it('should propagate errors', async () => {
    const task = jest.fn().mockRejectedValue(new Error('Task Failed'));
    await expect(queue.run(task)).rejects.toThrow('Task Failed');
  });

  it('should process queued tasks after active ones finish', async () => {
    queue = new RequestQueue(1);
    const task1 = () => new Promise((resolve) => setTimeout(() => resolve(1), 50));
    const task2 = () => Promise.resolve(2);

    const p1 = queue.run(task1);
    const p2 = queue.run(task2);

    const results = await Promise.all([p1, p2]);
    expect(results).toEqual([1, 2]);
  });
});
