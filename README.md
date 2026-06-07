# Meeting Intelligence Service

An AI-powered backend service that helps users manage meetings, extract actionable insights, track action items, and automatically send reminders. Built for the Hintro Engineering Internship Assignment.

## Features

- **Authentication:** Stateless JWT-based authentication for securing APIs.
- **Meeting Management:** Store meeting transcripts and metadata with pagination support.
- **AI Integration (Groq):** Analyzes meeting transcripts to automatically generate summaries, action items, decisions, and follow-up suggestions with strict timestamp citations.
- **Action Item Tracking:** Detects overdue action items and tracks task statuses (PENDING, IN_PROGRESS, COMPLETED).
- **Background Scheduler:** A `node-cron` job runs daily to trigger email reminders for overdue tasks.
- **Email Notifications:** Integrated with the Resend API to deliver automated reminder emails to assignees.
- **Production Ready:** Includes structured logging (Winston), request traceability, global error handling, and robust input validation (Zod).

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **AI Provider:** Groq (LLaMA 3.3)
- **Email Provider:** Resend
- **Validation:** Zod

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/meeting_intelligence?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
GROQ_API_KEY="your-groq-api-key"
RESEND_API_KEY="your-resend-api-key"
```

### 4. Database Setup
Run the Prisma migrations to set up your database schema:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Local Execution

**Start the development server:**
```bash
npm run dev
```

**Run the automated test suite:**
```bash
npm test
```

## API Documentation

Swagger OpenAPI documentation is automatically generated and accessible when the server is running.

- **Local URL:** `http://localhost:3000/api-docs`

### Example API Usage

**1. Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"password123","name":"John"}'
```

**2. Analyze a meeting (Requires Bearer Token):**
```bash
curl -X POST http://localhost:3000/api/meetings/:id/analyze \
-H "Authorization: Bearer <your_jwt_token>"
```

## Deployment Instructions

This application is ready to be deployed to any platform supporting Node.js and PostgreSQL (e.g., Render, Railway, Vercel).

### Deploying to Render
1. Create a new Web Service on Render and connect this GitHub repository.
2. Set the Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Set the Start Command: `npm start`
4. Add all required Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `RESEND_API_KEY`) in the Render dashboard.
5. Provide a hosted PostgreSQL database URL (Render provides free managed databases).
