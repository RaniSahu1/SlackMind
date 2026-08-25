import redisClient from "../config/redis.js";

const MAX_MESSAGES = 10;

function getConversationKey(conversationId) {
  return `conversation:${conversationId}`;
}

export async function getConversation(conversationId) {
  try {
    const key = getConversationKey(conversationId);

    const messages = await redisClient.get(key);

    if (!messages) {
      return [];
    }

    return JSON.parse(messages);
  } catch (error) {
    console.error("⚠️ Failed to read conversation from Redis:", error);

    // Redis unavailable → continue without conversation history
    return [];
  }
}

export async function addMessage(conversationId, role, content) {
  try {
    const key = getConversationKey(conversationId);

    const messages = await getConversation(conversationId);

    messages.push({
      role,
      content,
    });

    // Keep only recent messages
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    // Save conversation in Redis
    await redisClient.set(
      key,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error(
      "⚠️ Failed to save conversation to Redis:",
      error
    );

    // Do not break SlackMind if Redis is temporarily unavailable
  }
}