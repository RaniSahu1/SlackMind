import {
  addKnowledge,
} from "./services/knowledgeService.js";

await addKnowledge(
  "This is confidential project information.",
  {
    source: "private-test",
    type: "internal",
    visibility: "private",
    allowedUsers: ["U_ALLOWED_USER"],
    allowedChannels: ["C0BSTSE025N"],
  }
);

console.log(
  "🔐 Private knowledge inserted"
);