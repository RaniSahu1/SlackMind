import { createHandler } from "@vercel/slack-bolt";
import slackApp from "../../src/config/slack.js";
import receiver from "../../src/config/vercelReceiver.js";

export const POST = createHandler(
  slackApp,
  receiver
);