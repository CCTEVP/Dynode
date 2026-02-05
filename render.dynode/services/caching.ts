import { LRUCache } from "lru-cache";
import logger from "./logger";

interface CacheEntry {
  content: string;
  contentType: string;
  etag: string;
  timestamp: number;
}

const bundleCache = new LRUCache<string, CacheEntry>({
  max: 500, // Maximum number of cached items
  maxSize: 50 * 1024 * 1024, // 50MB total cache size
  sizeCalculation: (value) => value.content.length,
  ttl: 1000 * 60 * 15, // 15 minutes TTL
});

const caching = {
  /**
   * Get cached bundle by key
   */
  get(key: string): CacheEntry | undefined {
    return bundleCache.get(key);
  },

  /**
   * Store bundle in cache
   */
  set(key: string, content: string, contentType: string): void {
    const etag = `"${Date.now()}-${content.length}"`;
    bundleCache.set(key, {
      content,
      contentType,
      etag,
      timestamp: Date.now(),
    });
    logger.info(`Cache set: ${key} (${content.length} bytes)`);
  },

  /**
   * Invalidate cache for specific creative
   */
  invalidate(creativeId: string): void {
    const keys = Array.from(bundleCache.keys()).filter((key) =>
      key.startsWith(`${creativeId}:`)
    );
    keys.forEach((key) => bundleCache.delete(key));
    logger.info(`Cache invalidated for creative: ${creativeId} (${keys.length} entries)`);
  },

  /**
   * Clear all cache
   */
  clear(): void {
    bundleCache.clear();
    logger.info("Cache cleared");
  },

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: bundleCache.size,
      calculatedSize: bundleCache.calculatedSize,
      maxSize: bundleCache.max,
      maxSizeBytes: 50 * 1024 * 1024,
    };
  },

  /**
   * Cache components for a creative (replaces existing stub)
   */
  async cacheComponents(
    creativeID: string
  ): Promise<{ managementScript: string }> {
    const cacheKey = `${creativeID}:manager:js:true`;
    const cached = this.get(cacheKey);

    if (cached) {
      logger.info(`Cache hit for manager script: ${creativeID}`);
      return { managementScript: cached.content };
    }

    // Delegate to bundler for actual content generation
    const bundler = (await import("./bundler")).default;
    const result = await bundler.bundleComponents({
      creativeId: creativeID,
      name: "manager",
      items: [],
      mode: true,
      extension: "js",
    });

    this.set(cacheKey, result.payload, "application/javascript");
    return { managementScript: result.payload };
  },
};

export default caching;
