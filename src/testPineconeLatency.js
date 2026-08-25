import { knowledgeIndex } from "./config/pinecone.js";

const query = "What is React?";

console.log("🧪 Pinecone latency test started");

const start = Date.now();

const results = await knowledgeIndex.searchRecords({
  query: {
    topK: 5,
    inputs: {
      text: query,
    },
  },
  fields: [
    "text",
    "source",
    "type",
    "visibility",
  ],
});

console.log(
  `🌲 Pinecone WITHOUT filter: ${Date.now() - start}ms`
);

console.log(
  `📦 Results: ${results.result.hits.length}`
);