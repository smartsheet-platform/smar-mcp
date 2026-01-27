import { MetadataCache } from '../../src/utils/cache';

describe('MetadataCache', () => {
  let cache: MetadataCache<any>;

  beforeEach(() => {
    // Use shorter TTL for testing
    cache = new MetadataCache(100);
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should expire items after TTL', async () => {
    cache.set('key2', 'value2');
    expect(cache.get('key2')).toBe('value2');

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should respect max items limit (LRU-ish)', () => {
    // Create cache with size 2
    cache = new MetadataCache(1000, 2);

    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    cache.set('k3', 'v3'); // Should evict k1

    expect(cache.get('k1')).toBeUndefined();
    expect(cache.get('k2')).toBe('v2');
    expect(cache.get('k3')).toBe('v3');
  });
});
