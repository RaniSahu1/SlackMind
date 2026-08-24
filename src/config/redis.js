// Redis connection

import { createClient } from "redis";
import env from "./env.js";

const redisClient = createClient({
  username: env.redisUsername,
  password: env.redisPassword,

  socket: {
    host: env.redisHost,
    port: Number(env.redisPort),
    
  },
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

export async function connectRedis() {
  await redisClient.connect();

  console.log("🟢 Redis connected");
}

export default redisClient;