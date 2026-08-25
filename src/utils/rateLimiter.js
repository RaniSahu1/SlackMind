import redisClient from "../config/redis.js";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 5;

export async function checkRateLimit(userId) {
  const key = `rate-limit:${userId}`;

  const currentCount =
    await redisClient.incr(key);

  if (currentCount === 1) {
    await redisClient.expire(
      key,
      WINDOW_SECONDS
    );
  }

  return {
    allowed: currentCount <= MAX_REQUESTS,
    remaining: Math.max(
      0,
      MAX_REQUESTS - currentCount
    ),
  };
}