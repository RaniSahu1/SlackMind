
import {
  readPdfFile,
  createChunks,
} from "./services/documentService.js";

import {
  addDocumentChunks,deleteDocumentChunks,
} from "./services/knowledgeService.js";

const pdfText =
  await readPdfFile(
    "./knowledge/test.pdf"
  );

// console.log(
//   "\n📄 PDF CONTENT:\n"
// );

// console.log(pdfText);

console.log(
  `\n📄 PDF extracted successfully: ${pdfText.length} characters`
);

const chunks = createChunks(pdfText, 1000,200);

console.log(
  `🧩 Total chunks: ${chunks.length}`
);

console.log("\n📦 First chunk:\n");

console.log(chunks[0]);


await addDocumentChunks(
  chunks,
  {
    documentId: "reactjs-guide",
    source: "Reactjs.pdf",
    type: "documentation",
    visibility: "public",
  }
);

console.log(
  "✅ PDF successfully added to Pinecone"
);

// await deleteDocumentChunks(
//   "reactjs-guide"
// );