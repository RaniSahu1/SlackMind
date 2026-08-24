import {
  readTextFile,
  createChunks,
} from "./services/documentService.js";

import {
  addDocumentChunks,
} from "./services/knowledgeService.js";

const text =
  await readTextFile(
    "./knowledge/slackmind.txt"
  );

console.log(
  "\n📄 DOCUMENT CONTENT:\n"
);

console.log(text);

const chunks =
  createChunks(text, 100);

console.log(
  "\n🧩 CHUNKS:\n"
);

console.dir(chunks, {
  depth: null,
});

//  Store chunks in Pinecone
await addDocumentChunks(
  chunks,
  {
    documentId: "slackmind-introduction",
    source: "slackmind.txt",
    type: "documentation",
    visibility: "public",
  }
);

console.log(
  "\n✅ Document ingestion completed"
);