import { App } from "@slack/bolt";
import env from "./env.js";

const slackApp = new App({
  token: env.slackBotToken,
  signingSecret: env.slackSigningSecret,
});

export default slackApp;