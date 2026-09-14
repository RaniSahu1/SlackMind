import SlackBolt from "@slack/bolt";
import receiver from "./vercelReceiver.js";

const { App } = SlackBolt;

const slackBotToken = process.env.SLACK_BOT_TOKEN?.trim();
const slackSigningSecret =
  process.env.SLACK_SIGNING_SECRET?.trim();

console.log(
  "🔐 Slack bot token:",
  slackBotToken ? "PRESENT" : "MISSING"
);

console.log(
  "🔐 Slack signing secret:",
  slackSigningSecret ? "PRESENT" : "MISSING"
);

const slackApp = new App({
  token: slackBotToken,
  signingSecret: slackSigningSecret,
  receiver,
});

export default slackApp;