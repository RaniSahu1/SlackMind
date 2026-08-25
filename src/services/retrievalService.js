//  Pinecone semantic retrieval

import { knowledgeIndex } from "../config/pinecone.js";
//  Authorization
import {
  getUserPermissions,
} from "./authorizationService.js";

export async function searchKnowledge(
  query,
  userId,channelId
) {
 
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
  
  const results =
    await knowledgeIndex.searchRecords({
      query: {
        topK: 3,

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


  const hits = results.result.hits;

return hits.filter(
  (hit) => (hit._score ?? 0) >= 0.20
);
}