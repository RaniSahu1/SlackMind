import {
  canAccessKnowledge,
} from "./services/authorizationService.js";

const userId = "U_TEST_USER";

const publicKnowledge = {
  text: "SlackMind is an AI assistant.",
  visibility: "public",
};

const privateKnowledge = {
  text: "Confidential HR information.",
  visibility: "private",
  allowedUsers: ["U_ADMIN"],
};

console.log(
  "Public access:",
  canAccessKnowledge(
    userId,
    publicKnowledge
  )
);

console.log(
  "Private access:",
  canAccessKnowledge(
    userId,
    privateKnowledge
  )
);