import request from "supertest";
import "dotenv/config";
import app from "../src/app.js";
import prisma from "../src/config/db.js";

let token;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      email: `ai_test_${Date.now()}@example.com`,
      password: "password123",
      name: "AI Tester",
    });
  token = res.body.data.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/action-items", () => {
  test("creates action item with valid data", async () => {
    const res = await request(app)
      .post("/api/action-items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        task: "Write documentation",
        assignee: "alice@example.com",
        dueDate: "2026-12-31T00:00:00Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.actionItem.status).toBe("PENDING");
  });

  test("rejects invalid assignee email", async () => {
    const res = await request(app)
      .post("/api/action-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ task: "Test task", assignee: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects missing task", async () => {
    const res = await request(app)
      .post("/api/action-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ assignee: "alice@example.com" });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/action-items/:id/status", () => {
  let itemId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/action-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ task: "Status test task", assignee: "bob@example.com" });
    itemId = res.body.data.actionItem.id;
  });

  test("updates status to IN_PROGRESS", async () => {
    const res = await request(app)
      .patch(`/api/action-items/${itemId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.data.actionItem.status).toBe("IN_PROGRESS");
  });

  test("updates status to COMPLETED", async () => {
    const res = await request(app)
      .patch(`/api/action-items/${itemId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(200);
    expect(res.body.data.actionItem.status).toBe("COMPLETED");
  });

  test("rejects invalid status value", async () => {
    const res = await request(app)
      .patch(`/api/action-items/${itemId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "DONE" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("returns 404 for non-existent item", async () => {
    const res = await request(app)
      .patch("/api/action-items/00000000-0000-0000-0000-000000000000/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "COMPLETED" });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/action-items/overdue", () => {
  beforeAll(async () => {
    await prisma.actionItem.create({
      data: {
        task: "Overdue task",
        assignee: "overdue@example.com",
        status: "PENDING",
        dueDate: new Date("2020-01-01T00:00:00Z"),
      },
    });

    await prisma.actionItem.create({
      data: {
        task: "Done old task",
        assignee: "done@example.com",
        status: "COMPLETED",
        dueDate: new Date("2020-01-01T00:00:00Z"),
      },
    });

    await prisma.actionItem.create({
      data: {
        task: "No deadline task",
        assignee: "nodeadline@example.com",
        status: "PENDING",
      },
    });
  });

  test("returns items that are past due and not completed", async () => {
    const res = await request(app)
      .get("/api/action-items/overdue")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const tasks = res.body.data.actionItems.map((i) => i.task);
    expect(tasks).toContain("Overdue task");
  });

  test("does not return COMPLETED items even if past due", async () => {
    const res = await request(app)
      .get("/api/action-items/overdue")
      .set("Authorization", `Bearer ${token}`);

    const tasks = res.body.data.actionItems.map((i) => i.task);
    expect(tasks).not.toContain("Done old task");
  });

  test("does not return items with no due date", async () => {
    const res = await request(app)
      .get("/api/action-items/overdue")
      .set("Authorization", `Bearer ${token}`);

    const tasks = res.body.data.actionItems.map((i) => i.task);
    expect(tasks).not.toContain("No deadline task");
  });
});
