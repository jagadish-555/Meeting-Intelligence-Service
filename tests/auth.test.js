import request from "supertest";
import "dotenv/config";
import app from "../src/app";
import prisma from "../src/config/db";

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { contains: "_test_" } },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  const email = `user_test_${Date.now()}@example.com`;

  test("registers successfully with valid data", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123", name: "Test User" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.traceId).toBeDefined();
  });

  test("rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, password: "password123", name: "Test User" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Email already registered");
  });

  test("rejects invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "notanemail", password: "password123", name: "Test" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("rejects password shorter than 6 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `short_test_${Date.now()}@test.com`,
        password: "123",
        name: "Test",
      });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  const email = `login_test_${Date.now()}@example.com`;
  const password = "loginpassword";

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email, password, name: "Login Test" });
  });

  test("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test("rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("rejects non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@nowhere.com", password: "anything" });

    expect(res.status).toBe(401);
  });

  test("accessing protected route without token returns 401", async () => {
    const res = await request(app).get("/api/meetings");
    expect(res.status).toBe(401);
  });

  test("accessing protected route with invalid token returns 401", async () => {
    const res = await request(app)
      .get("/api/meetings")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  });
});
