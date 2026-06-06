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
