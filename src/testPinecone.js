import "dotenv/config";

import { knowledgeIndex } from "./config/pinecone.js";

const stats =
  await knowledgeIndex.describeIndexStats();

console.log("📊 Pinecone stats:");

console.dir(stats, {
  depth: null,
});