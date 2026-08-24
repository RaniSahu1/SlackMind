// 🆕 NEW
import "dotenv/config";

const env = {
  slackBotToken: process.env.SLACK_BOT_TOKEN,
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET,

    openRouterApiKey: process.env.OPENROUTER_API_KEY,

    redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisUsername: process.env.REDIS_USERNAME,
  redisPassword: process.env.REDIS_PASSWORD,
};

export default env;