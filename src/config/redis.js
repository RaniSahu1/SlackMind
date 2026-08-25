// Redis connection

import { createClient } from "redis";

import env from "./env.js";

const redisClient = createClient({
  username: env.redisUsername,
  password: env.redisPassword,

  socket: {
    host: env.redisHost,
    port: Number(env.redisPort),

    reconnectStrategy: (retries, cause) => {
      console.log(
        `🔄 Redis reconnect attempt #${retries}`,
        cause?.code || cause?.message
      );

      const delay = Math.min(retries * 500, 5000);

      return delay;
    },
  },
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
  console.log("🔌 Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("🟢 Redis ready");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

export async function connectRedis() {
  await redisClient.connect();
  console.log("🟢 Redis connected");
}

export default redisClient;