import request from "supertest";
import { getApp } from "./setup.js";

describe("Auth Routes", () => {

  let token;

  it("should register a user with valid password", async () => {
    const app = getApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "Test1234"  // Valid: 8+ chars, uppercase, lowercase, number
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.com");
  });

  it("should reject invalid email format", async () => {
    const app = getApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Invalid Email User",
        email: "invalid-email",
        password: "Test1234"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Please provide a valid email address");
  });

  it("should reject weak password", async () => {
    const app = getApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Weak Password User",
        email: "weak@example.com",
        password: "123456"  // Invalid: no uppercase, less than 8 chars
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Password must be at least 8 characters");
  });

  it("should login user and return token", async () => {
    const app = getApp();
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Test1234"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

});

