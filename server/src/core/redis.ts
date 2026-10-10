import Redis from 'ioredis';
import { config } from './config.js';
import { logger } from './logger.js';

class CacheManager {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: string; expiresAt: number }>();
  private isRedisConnected = false;

  constructor() {
    try {
      this.redis = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // don't spam reconnects if offline
        lazyConnect: true,
      });

      this.redis
        .connect()
        .then(() => {
          this.isRedisConnected = true;
          logger.info('Connected to Redis Cache');
        })
        .catch(() => {
          this.isRedisConnected = false;
          logger.debug('Redis unreachable. Operating with in-memory cache fallback.');
        });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // Fallback to memory
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // Fallback to memory
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(patternOrKey: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        if (patternOrKey.includes('*')) {
          const keys = await this.redis.keys(patternOrKey);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } else {
          await this.redis.del(patternOrKey);
        }
      } catch {
        // Fallback to memory
      }
    }

    if (patternOrKey.includes('*')) {
      const regex = new RegExp('^' + patternOrKey.replace(/\*/g, '.*') + '$');
      for (const k of this.memoryCache.keys()) {
        if (regex.test(k)) {
          this.memoryCache.delete(k);
        }
      }
    } else {
      this.memoryCache.delete(patternOrKey);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.flushdb();
      } catch {
        // Ignore
      }
    }
  }
}

export const cache = new CacheManager();
