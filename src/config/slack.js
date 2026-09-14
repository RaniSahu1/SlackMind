import SlackBolt from "@slack/bolt";
import env from "./env.js";
import receiver from "./vercelReceiver.js";

const { App } = SlackBolt;

const slackApp = new App({
  token: env.slackBotToken,
  signingSecret: env.slackSigningSecret,
  receiver,
  deferInitialization: true,
});

export default slackApp;