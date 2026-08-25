import "dotenv/config";

import {
  searchKnowledge,
} from "./services/retrievalService.js";



// const query ="What is React and how does it work?";
// const query ="What is the confidential project information?";
const query =
  "This is confidential project information.";

// const userId = "U_TEST_USER";
const userId = "U_ALLOWED_USER";

const results =
  await searchKnowledge(
    query,
    userId
  );

console.log("🔍 Search results:");

console.dir(results, {
  depth: null,
});