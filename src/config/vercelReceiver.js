import { VercelReceiver } from "@vercel/slack-bolt";
import env from "./env.js";

const receiver = new VercelReceiver({
  signingSecret: env.slackSigningSecret,
});

export default receiver;