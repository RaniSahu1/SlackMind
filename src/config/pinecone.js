import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const knowledgeIndex = pinecone.index("slackmind-knowledge");