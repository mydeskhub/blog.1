import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (!redis) return true;

  const bucketKey = `ratelimit:${key}`;
  const count = await redis.incr(bucketKey);

  if (count === 1) {
    await redis.expire(bucketKey, windowSeconds);
  }

  return count <= limit;
}
