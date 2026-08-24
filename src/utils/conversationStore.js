import redisClient from "../config/redis.js";

const MAX_MESSAGES = 10;

function getConversationKey(conversationId) {
  return `conversation:${conversationId}`;
}

export async function getConversation(conversationId) {
  const key = getConversationKey(conversationId);

  const messages = await redisClient.get(key);

  if (!messages) {
    return [];
  }

  return JSON.parse(messages);
}

export async function addMessage(conversationId, role, content) {
  const key = getConversationKey(conversationId);

  const messages = await getConversation(conversationId);

  messages.push({
    role,
    content,
  });

  //  keep only recent messages
  if (messages.length > MAX_MESSAGES) {
    messages.splice(0, messages.length - MAX_MESSAGES);
  }

  //  save conversation in Redis
  await redisClient.set(key, JSON.stringify(messages));
}