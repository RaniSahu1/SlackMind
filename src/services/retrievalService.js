//  Pinecone semantic retrieval

import { knowledgeIndex } from "../config/pinecone.js";

export async function searchKnowledge(query) {
  const results = await knowledgeIndex.searchRecords({
    query: {
      topK: 3,
      inputs: {
        text: query,
      },
    },
    fields: ["text", "source", "type"],
  });

  return results.result.hits;
}