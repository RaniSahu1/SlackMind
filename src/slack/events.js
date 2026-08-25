import slackApp from "../config/slack.js";
import {  generateRAGResponse, } from "../services/aiService.js";
import { getConversation,addMessage,} from "../utils/conversationStore.js";
import { searchKnowledge } from "../services/retrievalService.js";
import {
  checkRateLimit,
} from "../utils/rateLimiter.js";

slackApp.message(async ({ message, say }) => {
  const requestStart = Date.now();
  console.log("Received message:", message);

  if (message.subtype) {
    return;
  }

  const conversationId = `${message.channel}:${message.thread_ts || message.ts}`;
const userId = message.user;
const channelId = message.channel;

const rateLimit =
  await checkRateLimit(userId);

console.log(
  "🚦 Rate limit:",
  rateLimit
);

if (!rateLimit.allowed) {
  await say({
    text:
      "You have reached the request limit. Please try again in a minute.",
    thread_ts:
      message.thread_ts || message.ts,
  });

  return;
}

  const userMessage = message.text.replace(/<@[^>]+>/g, "").trim();

  try {
// Save user's message in Redis
   await addMessage(conversationId, "user", userMessage);
//Get conversation history
    const historyStart = Date.now();

const conversationHistory =
  await getConversation(conversationId);

console.log(
  `🧠 Redis history: ${Date.now() - historyStart}ms`
);
    const retrievalQuery = conversationHistory
  .slice(-4)
  .map(
    (message) =>
      `${message.role}: ${message.content}`
  )
  .join("\n");

// Search relevant knowledge


  const retrievalStart = Date.now();

const knowledge =
  await searchKnowledge(
    userMessage,
    userId,
    channelId
  );

console.log(
  `🔎 Pinecone retrieval: ${Date.now() - retrievalStart}ms`
);
console.log(
  "🔍 Retrieved knowledge:",
  knowledge.length
);

  //  Generate answer using: conversation + knowledge + question
  const aiStart = Date.now();

const aiResponse =
  await generateRAGResponse(
    userMessage,
    knowledge,
    conversationHistory
  );

console.log(
  `🤖 AI generation: ${Date.now() - aiStart}ms`
);

    

    await addMessage(conversationId, "assistant", aiResponse);

    const responseTime = Date.now() - requestStart;

console.log(
  `⏱️ SlackMind response time: ${responseTime}ms`
);

    await say({
      text: aiResponse,
      thread_ts: message.thread_ts || message.ts,
    });
  } catch (error) {
    console.error("AI response error:", error);

    await say({
      text: "Sorry, I couldn't process your request right now.",
      thread_ts: message.thread_ts || message.ts,
    });
  }

  
});