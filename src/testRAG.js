import "dotenv/config";

import { searchKnowledge } from "./services/retrievalService.js";

import { generateRAGResponse } from "./services/aiService.js";

// const question =
//   "What technologies does SlackMind use?";

const question =
  "What is React and how does it work?";

const knowledge =
  await searchKnowledge(question);

console.log("🔍 Retrieved knowledge:");
console.dir(knowledge, { depth: null });

const answer =
  await generateRAGResponse(
    question,
    knowledge,[]
  );

console.log("\n🤖 AI Answer:");
console.log(answer);