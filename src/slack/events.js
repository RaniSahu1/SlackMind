import slackApp from "../config/slack.js";
import {  generateRAGResponse, } from "../services/aiService.js";
import { getConversation,addMessage,} from "../utils/conversationStore.js";
import { searchKnowledge } from "../services/retrievalService.js";


slackApp.message(async ({ message, say }) => {
  console.log("Received message:", message);

  if (message.subtype) {
    return;
  }

  const conversationId = `${message.channel}:${message.thread_ts || message.ts}`;


  const userMessage = message.text.replace(/<@[^>]+>/g, "").trim();

  try {
// Save user's message in Redis
   await addMessage(conversationId, "user", userMessage);
//Get conversation history
    const conversationHistory =
    await getConversation(conversationId);

    const retrievalQuery = conversationHistory
  .slice(-4)
  .map(
    (message) =>
      `${message.role}: ${message.content}`
  )
  .join("\n");

// Search relevant knowledge
const knowledge =
  await searchKnowledge(
    `${retrievalQuery}\ncurrent question: ${userMessage}`,
    message.user,
    message.channel
  );
  console.log(
    "🔍 Retrieved knowledge:",
    knowledge.length
  );

  //  Generate answer using:
  // conversation + knowledge + question
  const aiResponse =
    await generateRAGResponse(
      userMessage,
      knowledge,
      conversationHistory
    );

    

    await addMessage(conversationId, "assistant", aiResponse);

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