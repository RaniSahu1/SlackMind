import "dotenv/config";

import { searchKnowledge } from "./services/retrievalService.js";

const query = "What technologies does SlackMind use?";

const results = await searchKnowledge(query);

console.log("🔍 Search results:");

console.dir(results, {
  depth: null,
});