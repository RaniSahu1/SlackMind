import "dotenv/config";

import { searchKnowledge } from "./services/retrievalService.js";

// const query = "What technologies does SlackMind use?";
const query = "What is React and how does it work?";

const results = await searchKnowledge(query);

console.log("🔍 Search results:");

console.dir(results, {
  depth: null,
});