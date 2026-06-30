const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const supertest = require("supertest");

require("../../test-utils/env");

const authRepository = require("./auth.repository");
const app = require("../../app");

test("POST /api/auth/login succeeds with valid credentials", async (t) => {
  const password_hash = await bcrypt.hash("correct-password", 10);
  t.mock.method(authRepository, "findUserByEmail", async () => ({
    user: { id: "1", email: "user@example.com", password_hash, role: "admin", full_name: "Test User" },
    error: null,
  }));

  const response = await supertest(app)
    .post("/api/auth/login")
    .send({ email: "user@example.com", password: "correct-password" });

  assert.equal(response.status, 200);
  assert.equal(response.body.role, "admin");
  assert.ok(response.body.token);
  assert.equal(response.body.user.email, "user@example.com");
  assert.equal(response.body.user.password_hash, undefined);
});

test("POST /api/auth/login rejects an unknown email", async (t) => {
  t.mock.method(authRepository, "findUserByEmail", async () => ({ user: null, error: null }));

  const response = await supertest(app)
    .post("/api/auth/login")
    .send({ email: "nobody@example.com", password: "whatever" });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: "Invalid email or password" });
});

test("POST /api/auth/login rejects a wrong password", async (t) => {
  const password_hash = await bcrypt.hash("correct-password", 10);
  t.mock.method(authRepository, "findUserByEmail", async () => ({
    user: { id: "1", email: "user@example.com", password_hash, role: "user", full_name: "Test User" },
    error: null,
  }));

  const response = await supertest(app)
    .post("/api/auth/login")
    .send({ email: "user@example.com", password: "wrong-password" });

  assert.equal(response.status, 401);
});

test("POST /api/auth/login returns 500 when the repository fails", async (t) => {
  t.mock.method(authRepository, "findUserByEmail", async () => {
    throw new Error("db unreachable");
  });

  const response = await supertest(app)
    .post("/api/auth/login")
    .send({ email: "user@example.com", password: "whatever" });

  assert.equal(response.status, 500);
});
