import request from "supertest";
import { getApp } from "./setup.js";

let token;
let taskId;

beforeAll(async () => {
  const app = getApp();
  
  // Register with strong password
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Task User",
      email: "task@example.com",
      password: "Test1234"  // Valid: 8+ chars, uppercase, lowercase, number
    });

  // Login
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "task@example.com",
      password: "Test1234"
    });

  token = res.body.token;
});

describe("Task Routes", () => {

  it("should not allow access without token", async () => {
    const app = getApp();
    const res = await request(app)
      .get("/api/tasks");

    expect(res.statusCode).toBe(401);
  });

  it("should create a task with priority and dueDate", async () => {
    const app = getApp();
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing",
        priority: "high",
        dueDate: "2025-12-31"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");
    expect(res.body.priority).toBe("high");

    taskId = res.body._id;
  });

  it("should get user tasks with pagination", async () => {
    const app = getApp();
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toBeDefined();
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it("should filter tasks by completed status", async () => {
    const app = getApp();
    const res = await request(app)
      .get("/api/tasks?completed=false")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toBeDefined();
  });

  it("should sort tasks by priority", async () => {
    const app = getApp();
    const res = await request(app)
      .get("/api/tasks?sortBy=priority&sortOrder=desc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toBeDefined();
  });

  it("should get single task by ID", async () => {
    const app = getApp();
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Task");
  });

  it("should update entire task with PUT", async () => {
    const app = getApp();
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Task",
        description: "Updated description",
        priority: "low",
        completed: true
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Task");
    expect(res.body.priority).toBe("low");
    expect(res.body.completed).toBe(true);
  });

  it("should partial update task with PATCH", async () => {
    const app = getApp();
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        completed: false
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it("should delete a task", async () => {
    const app = getApp();
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task deleted successfully");
  });

});
