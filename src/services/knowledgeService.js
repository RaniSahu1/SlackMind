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

//  Add document chunks to Pinecone

export async function addDocumentChunks(
  chunks,
  metadata = {}
) {
  const records = chunks.map(
    (chunk, index) => ({
      _id: `${metadata.documentId || "document"}-chunk-${index}`,
      text: chunk,

      ...metadata,

      chunkIndex: index,
    })
  );

  await knowledgeIndex.upsertRecords({
    records,
  });

  console.log(
    `🟢 ${records.length} document chunks added to Pinecone`
  );
}

//  Delete all chunks of a document

export async function deleteDocumentChunks(documentId) {
  await knowledgeIndex.deleteMany({
    filter: {
      documentId: {
        $eq: documentId,
      },
    },
  });

  console.log(
    `🗑️ Deleted existing chunks for: ${documentId}`
  );
}

//  Delete a single knowledge record
export async function deleteKnowledgeRecord(recordId) {
  await knowledgeIndex.deleteOne({id:recordId});

  console.log(
    `🗑️ Deleted knowledge record: ${recordId}`
  );
}