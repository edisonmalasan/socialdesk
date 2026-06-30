const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("../../test-utils/env");

const authRepository = require("./auth.repository");
const authService = require("./auth.service");

test("login returns null when the user does not exist", async (t) => {
  t.mock.method(authRepository, "findUserByEmail", async () => ({
    user: null,
    error: null,
  }));

  const result = await authService.login({
    email: "nobody@example.com",
    password: "irrelevant",
  });

  assert.equal(result, null);
});

test("login returns null when the password does not match", async (t) => {
  const password_hash = await bcrypt.hash("correct-password", 10);
  t.mock.method(authRepository, "findUserByEmail", async () => ({
    user: { id: "1", email: "user@example.com", password_hash, role: "user", full_name: "Test User" },
    error: null,
  }));

  const result = await authService.login({
    email: "user@example.com",
    password: "wrong-password",
  });

  assert.equal(result, null);
});

test("login returns a signed token and user payload on success", async (t) => {
  const password_hash = await bcrypt.hash("correct-password", 10);
  t.mock.method(authRepository, "findUserByEmail", async () => ({
    user: { id: "1", email: "user@example.com", password_hash, role: "admin", full_name: "Test User" },
    error: null,
  }));

  const result = await authService.login({
    email: "user@example.com",
    password: "correct-password",
  });

  assert.equal(result.role, "admin");
  assert.deepEqual(result.user, { id: "1", email: "user@example.com", full_name: "Test User" });

  const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
  assert.equal(decoded.id, "1");
  assert.equal(decoded.role, "admin");
});
