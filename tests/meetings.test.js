import { jest } from "@jest/globals";
import request from "supertest";
import "dotenv/config";

jest.unstable_mockModule("../src/services/aiService.js", () => ({
  default: {
    analyzeMeeting: jest.fn().mockResolvedValue({
      summary: [
        {
          text: "Team plans to launch next Friday.",
          citations: [{ timestamp: "00:10" }],
        },
      ],
      actionItems: [
        {
          task: "Prepare release notes",
          assignee: "alice@example.com",
          citations: [{ timestamp: "00:20" }],
        },
      ],
      decisions: [
        {
          text: "Launch confirmed for next Friday.",
          citations: [{ timestamp: "00:10" }],
        },
      ],
      followUpSuggestions: [
        {
          text: "Schedule a launch review meeting.",
          citations: [{ timestamp: "00:10" }],
        },
      ],
    }),
  },
}));

const { default: app } = await import("../src/app.js");
const { default: prisma } = await import("../src/config/db.js");

let token;
let createdMeetingId;

const testMeeting = {
  title: "Sprint Planning",
  participants: ["alice@example.com", "bob@example.com"],
  meetingDate: "2026-05-20T10:00:00Z",
  transcript: [
    {
      timestamp: "00:10",
      speaker: "John",
      text: "We should launch next Friday.",
    },
    {
      timestamp: "00:20",
      speaker: "Alice",
      text: "I will prepare release notes.",
    },
  ],
};

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      email: `mtg_test_${Date.now()}@example.com`,
      password: "password123",
      name: "Meeting Tester",
    });
  token = res.body.data.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/meetings", () => {
  test("creates meeting with valid data", async () => {
    const res = await request(app)
      .post("/api/meetings")
      .set("Authorization", `Bearer ${token}`)
      .send(testMeeting);

    expect(res.status).toBe(201);
    expect(res.body.data.meeting.title).toBe("Sprint Planning");
    createdMeetingId = res.body.data.meeting.id;
  });

  test("rejects missing title", async () => {
    const { title, ...noTitle } = testMeeting;
    const res = await request(app)
      .post("/api/meetings")
      .set("Authorization", `Bearer ${token}`)
      .send(noTitle);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects invalid participant email", async () => {
    const res = await request(app)
      .post("/api/meetings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testMeeting, participants: ["not-an-email"] });

    expect(res.status).toBe(400);
  });

  test("rejects empty transcript", async () => {
    const res = await request(app)
      .post("/api/meetings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...testMeeting, transcript: [] });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/meetings/:id", () => {
  test("returns meeting by id", async () => {
    const res = await request(app)
      .get(`/api/meetings/${createdMeetingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.meeting.id).toBe(createdMeetingId);
  });

  test("returns 404 for non-existent id", async () => {
    const res = await request(app)
      .get("/api/meetings/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("GET /api/meetings", () => {
  test("returns paginated list", async () => {
    const res = await request(app)
      .get("/api/meetings?page=1&limit=5")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.meetings)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
  });
});

describe("POST /api/meetings/:id/analyze", () => {
  test("returns analysis with citations", async () => {
    const res = await request(app)
      .post(`/api/meetings/${createdMeetingId}/analyze`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.analysis.summary).toBeDefined();
    expect(res.body.data.analysis.summary[0].citations).toBeDefined();
    expect(res.body.data.analysis.actionItems).toBeDefined();
  });

  test("returns cached result on second call", async () => {
    const res = await request(app)
      .post(`/api/meetings/${createdMeetingId}/analyze`)
      .set("Authorization", `Bearer ${token}`);

    const { default: aiService } = await import("../src/services/aiService.js");
    expect(aiService.analyzeMeeting).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
  });
});
