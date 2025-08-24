import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

// Production에서는 Upstash, 개발에서는 로컬 Redis 사용
const isProduction = process.env.NODE_ENV === 'production';

interface RedisInterface {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<string | null>;
  setex: (key: string, seconds: number, value: string) => Promise<string | null>;
  del: (key: string) => Promise<number>;
  keys: (pattern: string) => Promise<string[]>;
}

let redis: RedisInterface;

if (isProduction && process.env.REDIS_URL && process.env.REDIS_TOKEN) {
  // Upstash Redis for production
  redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  });
} else {
  // Local Redis for development
  const ioRedis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
  
  // Upstash 호환 인터페이스로 래핑
  redis = {
    get: async (key: string) => ioRedis.get(key),
    set: async (key: string, value: string) => ioRedis.set(key, value),
    setex: async (key: string, seconds: number, value: string) => ioRedis.setex(key, seconds, value),
    del: async (key: string) => ioRedis.del(key),
    keys: async (pattern: string) => ioRedis.keys(pattern),
  };
}

export default redis;