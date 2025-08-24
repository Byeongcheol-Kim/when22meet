import { Redis } from '@upstash/redis';

// Upstash Redis 인스턴스 생성
// 환경변수가 없으면 오류
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Upstash Redis 환경변수가 설정되지 않았습니다.');
  console.error('1. https://console.upstash.com 에서 Redis 데이터베이스를 생성하세요.');
  console.error('2. .env.local 파일에 UPSTASH_REDIS_REST_URL과 UPSTASH_REDIS_REST_TOKEN을 추가하세요.');
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;