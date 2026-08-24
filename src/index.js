import slackApp from "./config/slack.js";
import { connectRedis } from "./config/redis.js";

import "./slack/events.js";

// 🆕 NEW — Pinecone connection test
import { knowledgeIndex } from "./config/pinecone.js";

console.log("🟢 Pinecone index configured");

(async () => {
   await connectRedis();
  await slackApp.start(3000);

  console.log("⚡ SlackMind is running on port 3000");
})();