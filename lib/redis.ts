import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

// Production에서는 Upstash, 개발에서는 로컬 Redis 사용
const isProduction = process.env.NODE_ENV === 'production';

interface RedisInterface {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<string | null>;
  setex: (key: string, seconds: number, value: any) => Promise<string | null>;
  del: (key: string) => Promise<number>;
  keys: (pattern: string) => Promise<string[]>;
}

let redis: RedisInterface;

if (isProduction && process.env.REDIS_URL && process.env.REDIS_TOKEN) {
  // Upstash Redis for production
  const upstashRedis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  });
  
  // Upstash는 자동으로 JSON을 파싱/문자열화함
  redis = {
    get: async (key: string) => upstashRedis.get(key),
    set: async (key: string, value: any) => upstashRedis.set(key, value),
    setex: async (key: string, seconds: number, value: any) => upstashRedis.setex(key, seconds, value),
    del: async (key: string) => upstashRedis.del(key),
    keys: async (pattern: string) => upstashRedis.keys(pattern),
  };
} else {
  // Local Redis for development
  const ioRedis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
  
  // ioredis는 문자열을 반환하므로 JSON 파싱이 필요
  redis = {
    get: async (key: string) => {
      const data = await ioRedis.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    },
    set: async (key: string, value: any) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return ioRedis.set(key, stringValue);
    },
    setex: async (key: string, seconds: number, value: any) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return ioRedis.setex(key, seconds, stringValue);
    },
    del: async (key: string) => ioRedis.del(key),
    keys: async (pattern: string) => ioRedis.keys(pattern),
  };
}

export default redis;