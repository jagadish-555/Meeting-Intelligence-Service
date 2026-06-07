# Technical Decisions

## 1. Database Choice: PostgreSQL (via Prisma ORM)

**Why it was chosen:**
- Highly structured relational data (Users -> Meetings -> Action Items).
- Need for robust referential integrity and ACID compliance for action item status tracking.
- Prisma ORM provides excellent TypeScript/JavaScript safety, intuitive schema modeling, and out-of-the-box migrations.

**Alternatives considered:**
- **MongoDB:** While NoSQL provides flexibility for unstructured JSON (like transcripts), relational databases are far superior for complex queries like "find all overdue tasks assigned to X user". We achieved the best of both worlds in PostgreSQL by using its native `Json` column type for the transcripts and AI outputs while keeping core relationships strictly relational.

**Trade-offs:**
- Requires structured schema migrations compared to the schema-less nature of NoSQL.

## 2. Authentication Strategy: JWT (JSON Web Tokens)

**Why it was chosen:**
- Stateless authentication mechanism perfect for RESTful APIs.
- Easy to scale horizontally since the server does not need to store session states in memory or a database.
- Easily testable via Swagger and curl using the `Authorization: Bearer` header.

**Alternatives considered:**
- **Session-Based Auth :** Offers easier revocation of active sessions but requires additional infrastructure (like a Redis instance) to manage state, increasing deployment complexity for an MVP.

**Trade-offs:**
- Tokens cannot be easily revoked before expiration without implementing a complex token blocklist.

## 3. External Integration: Resend API (Email)

**Why it was chosen:**
- Modern, developer-friendly email API with an excellent Node.js SDK.
- Significantly more professional and actionable for end-users than a Slack or Discord webhook message.
- Allows for rich HTML formatting of the reminder emails.

**Alternatives considered:**
- **Discord/Slack Webhooks:** Extremely fast to set up, but requires the end-user to be in a specific workspace/channel. Email is universal.
- **SendGrid:** More legacy overhead and complex domain verification processes compared to Resend.

**Trade-offs:**
- Free-tier rate limits (2 emails per second) required implementing artificial processing delays in the reminder service loop.

## 4. Background Scheduler: node-cron

**Why it was chosen:**
- Lightweight, in-memory cron scheduler that runs within the existing Express application process.
- Zero infrastructure overhead. Does not require setting up external workers or message queues.

**Alternatives considered:**
- **BullMQ / Redis:** Perfect for distributed, high-scale job processing, but introduces a heavy dependency (Redis) which violates the desire for a simple, maintainable architecture for this assignment.

**Trade-offs:**
- Because it runs in-memory, if the application server is scaled horizontally to multiple instances, the cron job would fire multiple times simultaneously. For a production-scale application, a dedicated worker/queue would be necessary.

## 5. AI Provider: Groq (LLaMA 3.3)

**Why it was chosen:**
- Blistering fast inference speeds.
- Excellent JSON mode support, making it highly reliable for strictly structured API responses.

**Alternatives considered:**
- **OpenAI (GPT-4o):** Slower and more expensive, though slightly better at complex reasoning. LLaMA 3.3 via Groq provided the perfect balance of speed and accuracy for this specific extraction task.

**Trade-offs:**
- LLaMA models can sometimes struggle with deep implicit reasoning compared to GPT-4, requiring much stricter prompt engineering to prevent hallucinations.

## 6. Project Structure: MVC/Layered Architecture

**Why it was chosen:**
- Separates concerns cleanly into `controllers` (HTTP handling), `services` (business logic / AI / Email), `routes` (URL mapping), and `middleware` (auth, logging, errors).
- This is the industry-standard architecture for Node.js/Express APIs. It ensures the codebase remains highly readable and maintainable as the application scales.

**Alternatives considered:**
- **Vertical Slice / Domain-Driven Design (DDD):** Organizing folders by feature (e.g., `/meetings`, `/users`) rather than by technical layer. This is excellent for massive microservices, but over-engineered for a project of this scope.

