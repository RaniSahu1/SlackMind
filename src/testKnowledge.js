import { addKnowledge } from "./services/knowledgeService.js";

const testKnowledge = `
SlackMind is an AI-powered Slack assistant.

SlackMind can answer questions using AI,
maintain conversation context using Redis,
and retrieve relevant knowledge using Pinecone.

The project is built with Node.js, Slack Bolt,
Redis Cloud, Pinecone, OpenRouter, and Gemini.
`;

await addKnowledge(testKnowledge, {
  source: "test-document",
  type: "documentation",
});

console.log("✅ Test knowledge inserted");