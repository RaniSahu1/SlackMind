import {
  deleteKnowledgeRecord,
} from "./services/knowledgeService.js";

await deleteKnowledgeRecord(
  "knowledge-1787638687329"
);

console.log(
  "✅ Old private test deleted"
);