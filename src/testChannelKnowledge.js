import "dotenv/config";

import { knowledgeIndex } from "./config/pinecone.js";

const results =
  await knowledgeIndex.searchRecords({
    query: {
      topK: 5,
      inputs: {
        text: "This is confidential project information.",
      },
      filter: {
  $or: [
    {
      visibility: {
        $eq: "public",
      },
    },
    {
      allowedUsers: {
        $in: ["U0BRZEHJM34"],
      },
    },
    {
      allowedChannels: {
        $in: ["C0BSTSE025N"],
      },
    },
  ],
},},

    fields: [
      "text",
      "source",
      "type",
      "visibility",
      "allowedUsers",
      "allowedChannels",
    ],
  });

console.log("🔎 Private knowledge debug:");

console.dir(
  results.result.hits,
  { depth: null }
);