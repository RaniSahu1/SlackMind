import { knowledgeIndex } from "../config/pinecone.js";

export async function addKnowledge(text, metadata = {}) {
  await knowledgeIndex.upsertRecords({
    records: [
      {
        _id: `knowledge-${Date.now()}`,
        text,
        ...metadata,
      },
    ],
  });

  console.log("🟢 Knowledge added to Pinecone");
}