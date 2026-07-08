const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");

require("../../test-utils/env");

const usersRepository = require("./users.repository");
const app = require("../../app");

function tokenFor(role, id = "1") {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
}

test("GET /api/users rejects requests with no session", async () => {
  const response = await supertest(app).get("/api/users");
  assert.equal(response.status, 401);
});

test("GET /api/users rejects a non-admin session", async () => {
  const response = await supertest(app)
    .get("/api/users")
    .set("Cookie", `auth-token=${tokenFor("user")}`);

  assert.equal(response.status, 403);
});

test("GET /api/users returns the user directory for an admin session", async (t) => {
  t.mock.method(usersRepository, "findAll", async () => ({
    users: [{ id: "1", email: "admin@example.com", role: "admin", status: "active" }],
    error: null,
  }));

  const response = await supertest(app)
    .get("/api/users")
    .set("Cookie", `auth-token=${tokenFor("admin")}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].email, "admin@example.com");
});

test("PATCH /api/users/:id/disable toggles status for an admin session", async (t) => {
  t.mock.method(usersRepository, "findById", async () => ({
    user: { id: "2", status: "active" },
    error: null,
  }));
  t.mock.method(usersRepository, "setStatus", async (id, status) => ({
    user: { id, status },
    error: null,
  }));

  const response = await supertest(app)
    .patch("/api/users/2/disable")
    .set("Cookie", `auth-token=${tokenFor("admin")}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "inactive");
});

test("DELETE /api/users/:id rejects a tampered token", async () => {
  const response = await supertest(app)
    .delete("/api/users/2")
    .set("Cookie", "auth-token=garbage");

  assert.equal(response.status, 401);
});
