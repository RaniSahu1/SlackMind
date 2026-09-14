import { createHandler } from "@vercel/slack-bolt";

import slackApp from "../../src/config/slack.js";
import receiver from "../../src/config/vercelReceiver.js";

import "../../src/slack/events.js";

import { connectRedis } from "../../src/config/redis.js";

let redisConnected = false;

const handler = createHandler(
  slackApp,
  receiver
);

export const POST = async (request) => {
  if (!redisConnected) {
    await connectRedis();
    redisConnected = true;
  }

  return handler(request);
};