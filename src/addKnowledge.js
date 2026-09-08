import "dotenv/config";
import { knowledgeIndex } from "./config/pinecone.js";

const record = {
  _id: "soap-notes-rani-001",

  text: "SOAP notes are assigned to Rani.",

  type: "internal",

  visibility: "public",

  allowedUsers: [],
  allowedChannels: [],
};

async function addKnowledge() {
  try {
    console.log("📚 Adding knowledge to Pinecone...");

    await knowledgeIndex.upsertRecords({
      records:[record],
  });

    console.log("✅ Knowledge added successfully");
    console.log("📄 ID:", record._id);
    console.log("📝 Text:", record.text);
  } catch (error) {
    console.error(
      "❌ Failed to add knowledge:",
      error
    );
  }
}

addKnowledge();