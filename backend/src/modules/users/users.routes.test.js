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
    users: [
      { id: "1", email: "admin@example.com", role: "admin", status: "active" },
    ],
    error: null,
  }));

  const response = await supertest(app)
    .get("/api/users")
    .set("Cookie", `auth-token=${tokenFor("admin")}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].email, "admin@example.com");
});

test("POST /api/users successfully provisions a new user", async (t) => {
  t.mock.method(usersRepository, "create", async (data) => ({
    user: { id: "3", email: data.email, role: data.role, status: "active" },
    error: null,
  }));

  const response = await supertest(app)
    .post("/api/users")
    .set("Cookie", `auth-token=${tokenFor("admin")}`)
    .send({
      email: "newuser@example.com",
      password: "password123",
      role: "user",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.email, "newuser@example.com");
});

test("PUT /api/users/:id successfully updates user details", async (t) => {
  t.mock.method(usersRepository, "updateById", async (id, data) => ({
    user: { id, email: data.email, role: data.role },
    error: null,
  }));

  const response = await supertest(app)
    .put("/api/users/2")
    .set("Cookie", `auth-token=${tokenFor("admin")}`)
    .send({ email: "updated@example.com", role: "user" });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.email, "updated@example.com");
});

test("PUT /api/users/:id returns 404 if user does not exist", async (t) => {
  t.mock.method(usersRepository, "updateById", async () => ({
    user: null,
    error: null,
  }));

  const response = await supertest(app)
    .put("/api/users/999")
    .set("Cookie", `auth-token=${tokenFor("admin")}`)
    .send({ email: "missing@example.com", role: "user" });

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, "User not found");
});

test("PATCH /api/users/:id/disable toggles status for an admin session", async (t) => {
  t.mock.method(usersRepository, "findById", async () => ({
    user: { id: "2", status: "active" },
    error: null,
  }));
  t.mock.method(usersRepository, "setStatus", async (id, status) => ({
    user: { id, status: "inactive" },
    error: null,
  }));

  const response = await supertest(app)
    .patch("/api/users/2/disable")
    .set("Cookie", `auth-token=${tokenFor("admin")}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, "inactive");
});

test("PATCH /api/users/:id/disable returns 404 if user does not exist", async (t) => {
  t.mock.method(usersRepository, "findById", async () => ({
    user: null,
    error: null,
  }));

  const response = await supertest(app)
    .patch("/api/users/999/disable")
    .set("Cookie", `auth-token=${tokenFor("admin")}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, "User not found");
});

test("DELETE /api/users/:id successfully removes a user", async (t) => {
  t.mock.method(usersRepository, "deleteById", async () => ({
    error: null,
  }));

  const response = await supertest(app)
    .delete("/api/users/2")
    .set("Cookie", `auth-token=${tokenFor("admin")}`);

  assert.equal(response.status, 204);
});

test("DELETE /api/users/:id rejects a tampered token", async () => {
  const response = await supertest(app)
    .delete("/api/users/2")
    .set("Cookie", "auth-token=garbage");

  assert.equal(response.status, 401);
});
