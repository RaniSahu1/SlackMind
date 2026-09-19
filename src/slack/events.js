import slackApp from "../config/slack.js";
import {  generateRAGResponse, } from "../services/aiService.js";
import { getConversation,addMessage,} from "../utils/conversationStore.js";
import { searchKnowledge } from "../services/retrievalService.js";
import { checkRateLimit,} from "../utils/rateLimiter.js";
import { addKnowledge, findKnowledge,
  deleteKnowledgeRecord, addDocumentChunks } from "../services/knowledgeService.js";
  import {
  invalidateRetrievalCache,
} from "../utils/retrievalCache.js";

import {
  downloadSlackFile,
  readPdfFile,
  createChunks,
} from "../services/documentService.js";

import fs from "fs/promises";

import env from "../config/env.js";

slackApp.message(async ({ message, say }) => {
  const requestStart = Date.now();
  console.log("Received message:", message);

 if (
  message.subtype &&
  message.subtype !== "file_share"
) {
  return;
}

// --------------------------------------------------
// Message information and reply decision
// --------------------------------------------------

const botMention = "<@U0BS37CB2CC>";

const userId = message.user;
const channelId = message.channel;

const conversationId =
  `${channelId}:${message.thread_ts || message.ts}`;

const isBotMentioned =
  message.text?.includes(botMention);

const isInThread =
  Boolean(message.thread_ts);

const shouldReply =
  !message.bot_id &&
  (isBotMentioned || isInThread);

// --------------------------------------------------
// Clean and save every user message
// --------------------------------------------------

const cleanMessage =
  message.text?.replace(/<@[^>]+>/g, "").trim() || "";

const userMessage = cleanMessage;

// Ignore completely empty events.
// Allow PDF-only uploads to continue.
if (!cleanMessage && !message.files?.length) {
  return;
}

// Save only actual text messages in Redis.
// Do not save an empty message for PDF-only uploads.
if (cleanMessage) {
  await addMessage(
    conversationId,
    "user",
    userMessage
  );

  console.log(
    "💾 User message saved in Redis"
  );
}

// --------------------------------------------------
// Automatically store normal Slack messages as knowledge
// --------------------------------------------------

if (
  !shouldReply &&
  !message.files?.length &&
  cleanMessage &&
  !message.bot_id
) {
  try {
    await addKnowledge(cleanMessage, {
      type: "slack_message",
      visibility: "private",
      allowedUsers: [],
      allowedChannels: [channelId],
      source: "slack",
      sourceMessageId: message.ts,
      sourceUserId: userId,
    });

    await invalidateRetrievalCache(
      userId,
      channelId
    );

    console.log(
      "📚 Normal Slack message added to knowledge:",
      cleanMessage
    );
  } catch (error) {
    console.error(
      "❌ Failed to store Slack message as knowledge:",
      error
    );
  }

  return;
}


// --------------------------------------------------
// PDF upload and ingestion
// --------------------------------------------------

if (message.files?.length) {
  const pdfFiles = message.files.filter(
    (file) =>
      file.mimetype === "application/pdf" ||
      file.filetype === "pdf"
  );

  if (pdfFiles.length > 0) {
    try {
      await say({
        text:
          `📄 I received ${pdfFiles.length} PDF file(s).\n` +
          `⏳ Processing...`,
        thread_ts:
          message.thread_ts || message.ts,
      });

      for (const file of pdfFiles) {
        const safeFileName =
          file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const filePath = `/tmp/${safeFileName}`;

        console.log(
          `📥 Downloading PDF: ${file.name}`
        );

        await downloadSlackFile(
          file.url_private_download,
          env.slackBotToken,
          filePath
        );

        console.log(
          `📖 Reading PDF: ${file.name}`
        );

        const text =
          await readPdfFile(filePath);

        console.log(
          `📝 Extracted text length: ${text.length}`
        );

        const chunks =
          createChunks(text);

        console.log(
          `✂️ Created ${chunks.length} chunks`
        );

        await addDocumentChunks(
          chunks,
          {
            documentId: file.id,
            source: file.name,
            type: "pdf",
            visibility: "private",
            allowedUsers: [userId],
            allowedChannels: [channelId],
          }
        );

        await invalidateRetrievalCache(
          userId,
          channelId
        );

        await fs.unlink(filePath);

        console.log(
          `🟢 PDF processed successfully: ${file.name}`
        );
      }

      await say({
        text:
          "✅ PDF added to knowledge successfully.",
        thread_ts:
          message.thread_ts || message.ts,
      });
    } catch (error) {
      console.error(
        "❌ PDF processing error:",
        error
      );

      await say({
        text:
          "❌ I couldn't process the PDF right now.",
        thread_ts:
          message.thread_ts || message.ts,
      });
    }

    return;
  }
}

// --------------------------------------------------
// Rate limit only when bot should reply
// --------------------------------------------------

const rateLimit =
  await checkRateLimit(userId);

console.log(
  "🚦 Rate limit:",
  rateLimit
);

if (!rateLimit.allowed) {
  await say({
    text:
      "You have reached the request limit. Please try again in a minute.",
    thread_ts:
      message.thread_ts || message.ts,
  });

  return;
}

  // --------------------------------------------------
// Knowledge ingestion
// --------------------------------------------------

if (
  userMessage
    .toLowerCase()
    .startsWith("remember:")
) {
  const knowledgeText = userMessage
    .slice("remember:".length)
    .trim();

  if (!knowledgeText) {
    await say({
      text:
        "❌ Please provide knowledge after `remember:`.",
      thread_ts:
        message.thread_ts || message.ts,
    });

    return;
  }

  try {
    await addKnowledge(knowledgeText, {
      type: "internal",
      visibility: "private",
      allowedUsers: [userId],
      allowedChannels: [channelId],
    });

    await invalidateRetrievalCache(
  userId,
  channelId
);

    await say({
      text:
        "✅ Knowledge added successfully.",
      thread_ts:
        message.thread_ts || message.ts,
    });
  } catch (error) {
    console.error(
      "❌ Knowledge ingestion error:",
      error
    );

    await say({
      text:
        "❌ I couldn't add this knowledge right now.",
      thread_ts:
        message.thread_ts || message.ts,
    });
  }

  return;
}

// --------------------------------------------------
// Forget knowledge
// --------------------------------------------------

if (
  userMessage
    .toLowerCase()
    .startsWith("forget:")
) {
  const knowledgeText = userMessage
    .slice("forget:".length)
    .trim();

  if (!knowledgeText) {
    await say({
      text:
        "❌ Please provide the knowledge you want to forget.",
      thread_ts:
        message.thread_ts || message.ts,
    });

    return;
  }

  try {
    const results =
      await findKnowledge(knowledgeText);

    if (results.length === 0) {
      await say({
        text:
          "❌ I couldn't find matching knowledge.",
        thread_ts:
          message.thread_ts || message.ts,
      });

      return;
    }

    const bestMatch = results[0];

    const score = bestMatch._score ?? 0;

    console.log("🎯 Forget match:", {
  id: bestMatch._id,
  score,
  text: bestMatch.fields?.text,
});

    if (score < 0.50) {
      await say({
        text:
          "❌ I couldn't confidently identify that knowledge.",
        thread_ts:
          message.thread_ts || message.ts,
      });

      return;
    }

    await deleteKnowledgeRecord(
      bestMatch._id
    );
    await invalidateRetrievalCache(
  userId,
  channelId
);

    await say({
      text:
        `🗑️ Knowledge removed successfully.\n\n` +
        `Removed: ${bestMatch.fields?.text || knowledgeText}`,
      thread_ts:
        message.thread_ts || message.ts,
    });

  } catch (error) {
    console.error(
      "❌ Knowledge deletion error:",
      error
    );

    await say({
      text:
        "❌ I couldn't remove that knowledge right now.",
      thread_ts:
        message.thread_ts || message.ts,
    });
  }

  return;
}

// --------------------------------------------------
// Update knowledge
// --------------------------------------------------

if (
  userMessage
    .toLowerCase()
    .startsWith("update:")
) {
  const updateText = userMessage
    .slice("update:".length)
    .trim()
    .replace(/-&gt;/g, "->");

    console.log("🧪 UPDATE TEXT:", JSON.stringify(updateText));

  if (!updateText.includes("->")) {
    await say({
      text:
        "❌ Please use this format:\n`update: old knowledge -> new knowledge`",
      thread_ts:
        message.thread_ts || message.ts,
    });
    return;
  }

  const [oldKnowledge, newKnowledge] =
    updateText.split("->").map((item) => item.trim());

  if (!oldKnowledge || !newKnowledge) {
    await say({
      text:
        "❌ Both old and new knowledge are required.\n\nExample:\n`update: node notes are assigned to tanya -> node notes are assigned to Rani`",
      thread_ts:
        message.thread_ts || message.ts,
    });
    return;
  }

  try {
    const results =
      await findKnowledge(oldKnowledge);

    if (results.length === 0) {
      await say({
        text:
          "❌ I couldn't find the knowledge you want to update.",
        thread_ts:
          message.thread_ts || message.ts,
      });
      return;
    }

    const bestMatch = results[0];
const score = bestMatch._score ?? 0;

const recordId =
  bestMatch.id || bestMatch._id;

console.log("🎯 Update match:", {
  id: recordId,
  score,
  text: bestMatch.fields?.text,
});

if (!recordId) {
  await say({
    text:
      "❌ I found the knowledge, but couldn't identify its record ID.",
    thread_ts:
      message.thread_ts || message.ts,
  });
  return;
}

    if (score < 0.50) {
      await say({
        text:
          "❌ I couldn't confidently identify the knowledge you want to update.",
        thread_ts:
          message.thread_ts || message.ts,
      });
      return;
    }

    // Delete old knowledge
    await deleteKnowledgeRecord(recordId);

    // Add updated knowledge
    await addKnowledge(newKnowledge, {
      type:
        bestMatch.fields?.type || "internal",
      visibility:
        bestMatch.fields?.visibility || "private",
      allowedUsers:
        bestMatch.fields?.allowedUsers || [userId],
      allowedChannels:
        bestMatch.fields?.allowedChannels || [channelId],
    });

    await invalidateRetrievalCache(
  userId,
  channelId
);

    await say({
      text:
        `✅ Knowledge updated successfully.\n\n` +
        `Old: ${bestMatch.fields?.text || oldKnowledge}\n` +
        `New: ${newKnowledge}`,
      thread_ts:
        message.thread_ts || message.ts,
    });
  } catch (error) {
    console.error(
      "❌ Knowledge update error:",
      error
    );

    await say({
      text:
        "❌ I couldn't update that knowledge right now.",
      thread_ts:
        message.thread_ts || message.ts,
    });
  }

  return;
}

  try {

//Get conversation history
    const historyStart = Date.now();

const conversationHistory =
  await getConversation(conversationId);

console.log(
  `🧠 Redis history: ${Date.now() - historyStart}ms`
);
    
// Search relevant knowledge


  const retrievalStart = Date.now();

const knowledge =
  await searchKnowledge(
    userMessage,
    userId,
    channelId
  );

console.log(
  `🔎 Pinecone retrieval: ${Date.now() - retrievalStart}ms`
);
// console.log(
//   "🔍 Retrieved knowledge:",
//   knowledge.length
// );

console.log(
  "🔍 Retrieved knowledge:",
  knowledge.length
);

console.log(
  "📚 Knowledge details:",
  knowledge.map((item) => ({
    id: item.id,
    score: item._score,
    text: item.fields?.text,
  }))
);

  //  Generate answer using: conversation + knowledge + question
  const aiStart = Date.now();

const aiResponse =
  await generateRAGResponse(
    userMessage,
    knowledge,
    conversationHistory
  );

console.log(
  `🤖 AI generation: ${Date.now() - aiStart}ms`
);

    

    await addMessage(conversationId, "assistant", aiResponse);

    const responseTime = Date.now() - requestStart;

console.log(
  `⏱️ SlackMind response time: ${responseTime}ms`
);

    await say({
      text: aiResponse,
      thread_ts: message.thread_ts || message.ts,
    });
  } catch (error) {
    console.error("AI response error:", error);

    await say({
      text: "Sorry, I couldn't process your request right now.",
      thread_ts: message.thread_ts || message.ts,
    });
  }

  
});


