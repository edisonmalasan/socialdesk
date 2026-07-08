const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");

require("../../test-utils/env");

const app = require("../../app");

function tokenFor(role, id = "1") {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
}

test("GET /api/saas-analytics rejects requests with no session", async () => {
  const response = await supertest(app).get("/api/saas-analytics");
  assert.equal(response.status, 401);
});

test("GET /api/saas-analytics rejects a non-admin session", async () => {
  const response = await supertest(app)
    .get("/api/saas-analytics")
    .set("Cookie", `auth-token=${tokenFor("user")}`);

  assert.equal(response.status, 403);
});

test("GET /api/saas-analytics lets an admin through to the (unimplemented) surface", async () => {
  const response = await supertest(app)
    .get("/api/saas-analytics")
    .set("Cookie", `auth-token=${tokenFor("admin")}`);

  assert.equal(response.status, 501);
});
