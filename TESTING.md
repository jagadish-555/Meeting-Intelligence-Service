# Testing Strategy & Scenarios

This document outlines the testing methodology applied to the Meeting Intelligence Service, covering both automated unit/integration tests and manual scenarios.

## 1. Test Scenarios Executed

The application utilizes **Jest** and **Supertest** to execute automated integration tests against the core API endpoints (`/tests` directory).

**Authentication Tests (`auth.test.js`):**
- Validates successful user registration and password hashing.
- Ensures duplicate email registrations throw an appropriate 400 Validation Error.
- Verifies successful login issues a valid JWT.
- Confirms unauthorized access to protected routes returns a 401.

**Meeting Management Tests (`meetings.test.js`):**
- Verifies that authenticated users can successfully create a meeting with a valid JSON payload.
- Confirms that missing required fields (e.g., `title`, `transcript`) are caught by Zod and return a 400.
- Validates the `GET /api/meetings` pagination logic (ensuring page limits work).
- Confirms the AI analysis endpoint returns a 200 with grounded JSON insights.

**Action Item Tests (`actionItems.test.js`):**
- Verifies manual creation of Action Items works with valid assignee emails.
- Tests the `PATCH /api/action-items/:id/status` endpoint to ensure only valid Enums (PENDING, IN_PROGRESS, COMPLETED) are accepted.
- Confirms the Overdue endpoint correctly filters out completed tasks and future tasks.

## 2. Edge Cases Considered

- **Malformed Dates:** JavaScript's native date parser is notoriously brittle with single-digit ISO months/days (e.g., `2026-04-6T...`). The `meetingDate` validation utilizes `z.coerce.date()` alongside a custom error map to safely handle, convert, or gracefully reject bad formats.
- **Rate Limiting (Resend):** The free tier of Resend limits requests to 2 per second. The scheduled background job (`reminderService.js`) introduces deliberate `setTimeout` delays in its loop to prevent API throttling when processing a large batch of overdue tasks.
- **AI Name Resolution:** The AI naturally extracts raw names (e.g., "Alice") rather than emails. The prompt was strictly engineered to cross-reference extracted names against the `participants` array to ensure only valid emails are stored in the database, preventing downstream email delivery failures.

## 3. Limitations Discovered

- **Cron Scalability:** The current `node-cron` approach runs in-memory. If the Node.js process crashes exactly at 8:00 AM, reminders for that day will not be sent. Similarly, if the app is scaled to multiple Docker containers behind a load balancer, multiple containers might fire the same cron job simultaneously, leading to duplicate emails. A real message queue (like BullMQ + Redis) would be required for horizontal scaling.
