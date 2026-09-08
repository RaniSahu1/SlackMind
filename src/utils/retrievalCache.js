import redisClient from "../config/redis.js";

const CACHE_TTL_SECONDS = 300;

function getCacheKey(query, userId, channelId) {
  return `retrieval:${userId}:${channelId}:${query
    .trim()
    .toLowerCase()}`;
}

export async function getCachedKnowledge(
  query,
  userId,
  channelId
) {
  try {
    const key = getCacheKey(
      query,
      userId,
      channelId
    );

    const cached =
      await redisClient.get(key);

    if (!cached) {
      return null;
    }

    console.log("⚡ Retrieval cache hit");

    return JSON.parse(cached);
  } catch (error) {
    console.error(
      "⚠️ Retrieval cache read error:",
      error
    );

    return null;
  }
}

export async function setCachedKnowledge(
  query,
  userId,
  channelId,
  knowledge
) {
  try {
    const key = getCacheKey(
      query,
      userId,
      channelId
    );

    await redisClient.set(
      key,
      JSON.stringify(knowledge),
      {
        EX: CACHE_TTL_SECONDS,
      }
    );

    console.log("💾 Retrieval cache saved");
  } catch (error) {
    console.error(
      "⚠️ Retrieval cache write error:",
      error
    );
  }
}

export async function invalidateRetrievalCache(
  userId,
  channelId
) {
  try {
    const pattern = `retrieval:${userId}:${channelId}:*`;

    for await (
      const keys of redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      })
    ) {
      const keyList = Array.isArray(keys) ? keys : [keys];

      for (const key of keyList) {
        if (key) {
          await redisClient.del(key);
        }
      }
    }

    console.log("🧹 Retrieval cache invalidated");
  } catch (error) {
    console.error(
      "⚠️ Retrieval cache invalidation error:",
      error
    );
  }
}