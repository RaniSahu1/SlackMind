import SlackBolt from "@slack/bolt";
import env from "./env.js";

const { App } = SlackBolt;

const slackApp = new App({
  token: env.slackBotToken,
  signingSecret: env.slackSigningSecret,
});

export default slackApp;