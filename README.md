# SlackMind 🤖

### AI-Powered Slack Knowledge Assistant

SlackMind is an AI-powered knowledge assistant that works directly inside Slack. It allows users to ask questions, receive AI-generated answers, and upload PDF documents that can later be used as a knowledge source.

The project combines **Slack, Node.js, Redis, Pinecone, Retrieval-Augmented Generation (RAG), and OpenRouter AI** to create a practical AI assistant for team communication and knowledge retrieval.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Problem Statement](#-problem-statement)
* [Solution](#-solution)
* [Features](#-features)
* [How SlackMind Works](#-how-slackmind-works)
* [Architecture](#-architecture)
* [Technology Stack](#-technology-stack)
* [Example Usage](#-example-usage)
* [PDF Knowledge Ingestion](#-pdf-knowledge-ingestion)
* [Security and Access Control](#-security-and-access-control)
* [Environment Variables](#-environment-variables)
* [Local Setup](#-local-setup)
* [Running the Project](#-running-the-project)
* [Deployment](#-deployment)
* [Testing](#-testing)
* [Author](#-author)

---

## 🌟 Overview

Teams often store important information in different places such as:

* Slack conversations
* PDF documents
* Project documentation
* Technical notes
* Internal knowledge bases

Finding the correct information manually can take time.

SlackMind solves this problem by allowing users to ask questions directly inside Slack. The assistant searches relevant stored knowledge and generates a useful answer using an AI model.

### Example

A user can ask:

```text
@SlackMind What is the MERN stack?
```

SlackMind can respond with an explanation of:

* MongoDB
* Express.js
* React
* Node.js

Users can also upload a PDF and ask questions based on its content.

---

## 🎯 Problem Statement

Traditional knowledge-sharing systems have several problems:

1. Information is distributed across multiple documents and conversations.
2. Users spend time searching for relevant information.
3. Important knowledge may be difficult to find later.
4. Team members may repeatedly ask the same questions.
5. Sensitive information should only be available to authorized users.

SlackMind was created to provide a centralized, conversational way to access useful knowledge inside Slack.

---

## 💡 Solution

SlackMind works as an AI assistant inside a Slack workspace.

The user sends a question in a Slack channel and mentions the bot:

```text
@SlackMind Explain JavaScript promises
```

The application then:

1. Receives the Slack event.
2. Identifies the user and channel.
3. Checks rate limits.
4. Retrieves relevant conversation history.
5. Searches the knowledge base when required.
6. Sends the context to the AI model.
7. Generates an answer.
8. Sends the response back to Slack.
9. Stores useful conversation history for future questions.

---

## ✨ Features

### 1. Slack AI Assistant

Users can interact with SlackMind directly inside Slack by mentioning the bot.

```text
@SlackMind What is REST API?
```

The assistant provides clear and concise AI-generated responses.

---

### 2. PDF Knowledge Ingestion

Users can upload PDF documents in Slack and ask SlackMind to add them to its knowledge base.

Example:

```text
@SlackMind add this PDF to knowledge
```

The application:

* Downloads the PDF securely using the Slack bot token.
* Extracts text from the PDF.
* Splits the extracted text into smaller chunks.
* Stores the chunks in Pinecone.
* Adds access-control metadata.
* Makes the information available for future questions.

---

### 3. Retrieval-Augmented Generation

SlackMind uses Retrieval-Augmented Generation, commonly called RAG.

RAG means that the application first retrieves relevant information from a knowledge base and then provides that information to the AI model before generating an answer.

This helps the assistant answer questions using project-specific knowledge instead of relying only on the model's general knowledge.

---

### 4. Semantic Search

SlackMind uses Pinecone integrated embeddings for semantic retrieval.

This means that the system searches by meaning rather than only matching exact keywords.

For example, the following questions may retrieve similar knowledge:

```text
What technologies are used in MERN?
```

```text
Explain the four main components of MERN.
```

---

### 5. Conversation History

SlackMind stores conversation history in Redis.

This allows the assistant to understand follow-up questions such as:

```text
User: What is React?
SlackMind: React is a JavaScript library...

User: What are its main features?
```

The second question can be understood using the previous conversation context.

---

### 6. Retrieval Cache

SlackMind uses Redis caching for retrieved knowledge.

Caching helps to:

* Reduce repeated database searches.
* Improve response speed.
* Reduce unnecessary Pinecone requests.
* Improve the overall user experience.

The cache is invalidated when new knowledge is added.

---

### 7. Rate Limiting

SlackMind includes rate limiting to control how frequently a user can send requests.

Rate limiting helps to:

* Prevent excessive API usage.
* Control AI costs.
* Reduce accidental request overload.
* Improve application stability.

---

### 8. Access-Controlled Knowledge

Knowledge records include metadata such as:

* User ID
* Channel ID
* Visibility
* Document ID
* Source name
* Document type

This allows the retrieval layer to return only the knowledge that the current user or channel is allowed to access.

---

### 9. Prompt Injection Protection

Retrieved documents are treated as reference data.

SlackMind instructs the AI model not to follow instructions that may appear inside uploaded documents.

This helps reduce the risk of prompt injection through untrusted knowledge content.

---

### 10. Manual Knowledge Management

SlackMind supports manual knowledge operations such as:

```text
remember:
```

```text
forget:
```

```text
update:
```

These commands can be used to manage stored knowledge and conversation-related information.

---

## 🔄 How SlackMind Works

The complete flow is:

```text
User asks a question in Slack
            |
            v
Slack sends an event
            |
            v
SlackMind receives the event
            |
            v
User and channel are identified
            |
            v
Rate limit is checked
            |
            v
Conversation history is retrieved
            |
            v
Relevant knowledge is searched in Pinecone
            |
            v
Retrieved context is combined with the question
            |
            v
OpenRouter AI model generates an answer
            |
            v
Answer is sent back to Slack
            |
            v
Conversation history is saved in Redis
```

---

## 🧠 PDF Processing Flow

```text
PDF uploaded in Slack
          |
          v
Slack private file URL is received
          |
          v
PDF downloaded using Slack bot authentication
          |
          v
Text extracted from the PDF
          |
          v
Text divided into smaller chunks
          |
          v
Chunks uploaded to Pinecone
          |
          v
Access-control metadata added
          |
          v
PDF becomes searchable knowledge
```

---

## 🏗️ Architecture

SlackMind uses a backend-oriented architecture.

```text
Slack Workspace
       |
       v
Slack Events API
       |
       v
Slack Bolt Application
       |
       v
Event Handlers
       |
       +--------------------+
       |                    |
       v                    v
Redis                 Knowledge Retrieval
       |                    |
       |                    v
       |                Pinecone
       |                    |
       +---------+----------+
                 |
                 v
          OpenRouter AI
                 |
                 v
          Slack Response
```

### Main Responsibilities

#### Slack

Slack is the user interface. Users interact with SlackMind through messages and file uploads.

#### Node.js

Node.js runs the backend application and coordinates all services.

#### Slack Bolt

Slack Bolt receives Slack events and handles communication with the Slack platform.

#### Redis

Redis stores:

* Conversation history
* Rate-limit information
* Retrieval cache

#### Pinecone

Pinecone stores searchable document chunks and supports semantic retrieval.

#### OpenRouter

OpenRouter provides access to the AI model used to generate responses.

#### Vercel

Vercel hosts the serverless Slack event endpoint.

---

## 🛠️ Technology Stack

| Technology                     | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| Node.js                        | Backend runtime                                  |
| JavaScript                     | Application programming language                 |
| ES Modules                     | JavaScript module system                         |
| Slack Bolt                     | Slack event handling                             |
| Slack Events API               | Receiving Slack messages and file events         |
| Redis Cloud                    | Conversation history, caching, and rate limiting |
| Pinecone                       | Vector search and knowledge retrieval            |
| Pinecone Integrated Embeddings | Converting text into searchable representations  |
| OpenRouter                     | AI model API                                     |
| Gemini Flash Lite              | AI response generation                           |
| Axios                          | Downloading Slack files                          |
| pdf-parse                      | Extracting text from PDF documents               |
| Vercel                         | Deployment and serverless hosting                |
| ngrok                          | Local Slack webhook testing                      |
| Git and GitHub                 | Version control and source-code hosting          |

---

## 💬 Example Usage

### Ask a General Question

In Slack:

```text
@SlackMind What is Node.js?
```

---

### Ask a Technical Question

```text
@SlackMind Explain the difference between SQL and NoSQL databases.
```

---

### Ask a Follow-up Question

```text
@SlackMind What is React?
```

Then:

```text
@SlackMind What are its main advantages?
```

---

### Add a PDF to Knowledge

Upload a PDF in the Slack channel and mention SlackMind:

```text
@SlackMind add this PDF to knowledge
```

---

### Ask a Question from the PDF

```text
@SlackMind What are the main technologies discussed in this PDF?
```

---

### Store Knowledge Manually

```text
remember: Redis is used for caching and conversation history.
```

---

### Update Knowledge

```text
update: Redis is used for caching, rate limiting, and conversation history.
```

---

### Forget Knowledge

```text
forget: Redis is used for caching.
```

---

## 📄 PDF Knowledge Ingestion

SlackMind supports PDF-based knowledge retrieval.

### Processing Steps

1. A user uploads a PDF to Slack.
2. Slack sends a file event to the backend.
3. SlackMind verifies that the file is a PDF.
4. The PDF is downloaded using the Slack bot token.
5. Text is extracted using `pdf-parse`.
6. The extracted text is divided into chunks.
7. Chunks are uploaded to Pinecone.
8. Metadata is attached to every chunk.
9. The retrieval cache is invalidated.
10. The PDF becomes available for future questions.

### Chunking

The application divides long documents into smaller pieces.

The current chunking configuration is:

```text
Chunk size: 1000 characters
Overlap: 200 characters
```

Overlap helps preserve context between neighboring chunks.

---

## 🔐 Security and Access Control

SlackMind uses environment variables for sensitive configuration.

The following values must never be committed to GitHub:

* Slack bot token
* Slack signing secret
* OpenRouter API key
* Pinecone API key
* Redis username
* Redis password

These values are stored in environment variables.

### Knowledge Permissions

Knowledge records can contain:

```text
documentId
source
type
visibility
allowedUsers
allowedChannels
chunkIndex
```

The retrieval service uses this metadata to prevent unauthorized knowledge from being returned.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_SIGNING_SECRET=your_slack_signing_secret

OPENROUTER_API_KEY=your_openrouter_api_key

PINECONE_API_KEY=your_pinecone_api_key

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
```


---

## 💻 Local Setup

### Prerequisites

Install the following before running the project:

* Node.js
* npm
* Git
* A Slack workspace
* A Slack app
* Redis Cloud account
* Pinecone account
* OpenRouter account
* ngrok account or installation

---

### 1. Clone the Repository

```bash
git clone https://github.com/RaniSahu1/SlackMind.git
```

Move into the project directory:

```bash
cd SlackMind
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a file named:

```text
.env
```

Add the required environment variables.

---

### 4. Configure Slack

Create a Slack app and configure:

* Bot token
* Signing secret
* Event subscriptions
* Required OAuth scopes
* Message event subscriptions
* PDF file access permissions

The Slack request URL should point to the deployed or locally exposed event endpoint.

---

### 5. Configure Pinecone

Create or configure a Pinecone index with the required integrated embedding configuration.

The project uses:

```text
Index name: slackmind-knowledge
Embedding model: llama-text-embed-v2
Cloud: AWS
Region: us-east-1
```

---

### 6. Configure Redis

Create a Redis database and add its connection details to `.env`.

Redis is used for:

* Conversation history
* Rate limiting
* Retrieval caching

---

## ▶️ Running the Project

### Start the Development Server

```bash
npm run dev
```

The local application runs on:

```text
http://localhost:3000
```

### Start the Normal Server

```bash
npm start
```

---

## 🌐 Local Slack Testing with ngrok

Slack cannot directly access `localhost`.

ngrok creates a public HTTPS URL that forwards requests to the local server.

Start the application:

```bash
npm run dev
```

In another terminal, run:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL generated by ngrok.

Example:

```text
https://your-ngrok-url.ngrok-free.dev
```

Add the Slack events path:

```text
https://your-ngrok-url.ngrok-free.dev/slack/events
```

Use this URL in Slack:

```text
Slack App
→ Event Subscriptions
→ Request URL
```

After verification, test the bot inside Slack.

---

## 🚀 Deployment

SlackMind is deployed using Vercel.

### Deployment Type

This project is a backend/serverless application.

It does not contain a traditional frontend website.

The Vercel deployment provides the Slack event endpoint:

```text
https://slack-mind-topaz.vercel.app/api/slack/events
```

### Important Note

Opening the root URL:

```text
https://slack-mind-topaz.vercel.app
```

may show:

```text
404 NOT_FOUND
```

This is expected because the project is not a frontend website.

The application is designed to receive Slack events through:

```text
/api/slack/events
```

---

## 🧪 Testing

### Basic Bot Test

Send the following message in a Slack channel where SlackMind is installed:

```text
@SlackMind Hello
```

Expected result:

```text
SlackMind responds with an AI-generated answer.
```

---

### Knowledge Retrieval Test

```text
@SlackMind What is MERN?
```

Expected result:

```text
MongoDB
Express.js
React
Node.js
```

---

### PDF Test

1. Upload a PDF in Slack.
2. Mention SlackMind.
3. Ask SlackMind to add the PDF to knowledge.
4. Wait for the success message.
5. Ask a question based on the PDF.

Expected result:

```text
PDF added to knowledge successfully.
```

---

### Cache Test

Ask the same knowledge-based question more than once.

The second request may use the Redis retrieval cache instead of performing the same retrieval again.

---

### Rate Limit Test

Send multiple requests quickly.

The rate limiter should restrict excessive requests according to the configured limit.

---

## 🔗 Project Links

### GitHub Repository

[SlackMind Source Code](https://github.com/RaniSahu1/SlackMind)

### Live Slack Demo

SlackMind runs inside a Slack workspace.

To try it:

1. Join the Slack workspace.
2. Open the `#slackmind-playground` channel.
3. Mention the bot:

```text
@SlackMind What is MERN?
```

> Note: A Slack workspace invitation is required to try the live bot.

---

## 👩‍💻 Author

**Rani Sahu**

B.Tech Computer Science and Engineering Graduate

GitHub: [RaniSahu1](https://github.com/RaniSahu1)

---

## ⭐ If You Find This Project Useful

Feel free to explore the source code, raise issues, suggest improvements, or use the project as a reference for learning Slack bots, backend development, AI integrations, and Retrieval-Augmented Generation.

---
