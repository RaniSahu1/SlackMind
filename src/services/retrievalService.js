//  Pinecone semantic retrieval

import { knowledgeIndex } from "../config/pinecone.js";
//  Authorization
import {
  getUserPermissions,
} from "./authorizationService.js";

import {
  getCachedKnowledge,
  setCachedKnowledge,
} from "../utils/retrievalCache.js";

export async function searchKnowledge(
  query,
  userId,channelId
) {
  const cachedKnowledge =
  await getCachedKnowledge(
    query,
    userId,
    channelId
  );

if (cachedKnowledge !== null) {
  return cachedKnowledge;
}
 
  const permissions =
    getUserPermissions(userId);

  const filters = [];
  

  //  Public knowledge
  if (permissions.canAccessPublic) {
    filters.push({
      visibility: {
        $eq: "public",
      },
    });
  }

  // User-specific knowledge
  filters.push({
    allowedUsers: {
      $in: [userId],
    },
  });

  

  //  Channel-specific knowledge
  filters.push({
    allowedChannels: {
      $in: [channelId],
    },
  });
  
  const pineconeStart = Date.now();
  const results =
    await knowledgeIndex.searchRecords({
      query: {
        topK: 5,

        inputs: {
          text: query,
        },

        //  Authorization filter
        filter: {
          $or: filters,
        },
      },

      fields: [
        "text",
        "source",
        "type",
        "visibility",
        "allowedUsers",
        "allowedChannels",
      ],
    });
console.log(
  `🌲 Pinecone API call: ${Date.now() - pineconeStart}ms`
);

  const hits = results.result.hits;

const filteredHits = hits.filter(
  (hit) => (hit._score ?? 0) >= 0.20
);

await setCachedKnowledge(
  query,
  userId,
  channelId,
  filteredHits
);

return filteredHits;
}