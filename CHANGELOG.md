# Changelog

All notable changes to this project will be documented in this file.

## [Milestone 1]

### Added

- **Project Structure & Dependencies:** Initialized the Node.js project environment, established the foundational directory structure (`src/routes`, `src/controllers`, `src/services`, `src/middleware`, etc.), and set up the project configuration.
- **Code Formatting:** Integrated Prettier to ensure consistent code styling and maintainability across the repository.
- **Express Server Setup:** Created the core application setup in `src/app.js` and `src/server.js`, including basic CORS, JSON parsing, and a `/health` check endpoint.
- **Database Architecture (Prisma ORM):** Configured Prisma Client for PostgreSQL and designed the initial relational database schema (`schema.prisma`) which includes models for `User`, `Meeting`, `MeetingAnalysis`, `ActionItem`, and `ReminderHistory`.
- **Global Error Handling:** Implemented a structured global error-handling mechanism (`src/middleware/errorHandler.js`) to intercept application errors and return consistent HTTP responses.
- **Request Logging:** Added a custom request logging middleware (`src/middleware/requestLogger.js`) to capture incoming HTTP request details for debugging and monitoring.
- **Request Traceability:** Added a trace ID middleware (`src/middleware/traceId.js`) that attaches a unique identifier to every request, improving the ability to track request life cycles in logs.

## [Milestone 2] - Authentication

### Added

- **User Registration & Login:** Implemented endpoints for user registration (`/api/auth/register`) and login (`/api/auth/login`).
- **Authentication Middleware:** Added JWT-based authentication middleware (`src/middleware/auth.js`) to protect secure routes.
- **API Documentation:** Added Swagger documentation for all authentication endpoints.

## [Milestone 3] - Core Features & AI Integration

### Added

- **AI Transcript Analysis:** Implemented an AI service (`src/services/aiService.js`) integrating Groq LLM with Zod validation to strictly enforce JSON schemas for transcript analysis.
- **Meeting Endpoints:** Implemented endpoints for creating (`/api/meetings`), listing (`/api/meetings`), fetching details (`/api/meetings/:id`), and triggering AI transcript analysis (`/api/meetings/:id/analyze`).
- **Action Item Endpoints:** Implemented endpoints for creating (`/api/action-items`), listing (`/api/action-items`), fetching overdue items (`/api/action-items/overdue`), and updating statuses (`/api/action-items/:id/status`).
- **API Documentation:** Added Swagger OpenAPI documentation for the meeting and action items endpoints.

## [Milestone 4] - Reminders & Email Notifications

### Added

- **Email Notifications:** created notification systems with the Resend API to send action item reminders via email (`src/services/resendEmailService.js`).
- **Smart Due Date Extraction:** Enhanced the Groq AI prompt (`src/services/aiService.js`) to parse and resolve relative due dates from meeting transcripts and persist them to the database.
- **Background Scheduler:** Configured a `node-cron` scheduled background job (`src/jobs/reminderJob.js`) to automatically find overdue action items and trigger email reminders every morning at 8:00 AM.
- **Rate Limiting Protection:** Added deliberate processing delays in the `reminderService.js` loop to safely comply with Resend's free-tier rate limits.

### Changed

- **Custom Sender Email:** Updated the Resend configuration to send emails from a verified custom domain instead of the default testing address because of Resend's restrictions which allowed sending emails only to verified recipients.
- **Strict Assignee Parsing:** Modified the AI prompt (`aiService.js`) to cross-reference extracted assignees against the meeting's participants array, ensuring the generated `assignee` is always a valid email address rather than a raw name.
