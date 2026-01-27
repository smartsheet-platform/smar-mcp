export class MetadataCache<T> {
  private cache: Map<string, { value: T; expiresAt: number }>;
  private ttl: number;
  private maxSize: number;

  /**
   * Simple in-memory cache with TTL and Max Size.
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   * @param maxSize Maximum number of items to store (default: 100)
   */
  constructor(ttl: number = 300000, maxSize: number = 100) {
    this.cache = new Map();
    this.ttl = ttl;
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: string, value: T): void {
    // Evict oldest if full (simple approach: delete first key in map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
