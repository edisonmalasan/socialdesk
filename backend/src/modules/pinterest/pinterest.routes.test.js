const { test } = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");

require("../../test-utils/env");

const pinterestService = require("./pinterest.service");
const dbService = require("../social-connections/social-connections.service");
const app = require("../../app");

test("GET /api/auth/pinterest/oauth requires a userId", async () => {
  const response = await supertest(app).get("/api/auth/pinterest/oauth");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "userId is required" });
});

test("GET /api/auth/pinterest/oauth redirects to the Pinterest OAuth screen", async () => {
  const response = await supertest(app).get("/api/auth/pinterest/oauth?userId=7");

  assert.equal(response.status, 302);
  assert.match(response.headers.location, new RegExp(`client_id=${process.env.PINTEREST_APP_ID}`));
  assert.match(response.headers.location, /state=7/);
});

test("GET /api/auth/pinterest/callback requires an authorization code", async () => {
  const response = await supertest(app).get("/api/auth/pinterest/callback?state=7");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Authorization code missing" });
});

test("GET /api/auth/pinterest/callback requires userId (state)", async () => {
  const response = await supertest(app).get("/api/auth/pinterest/callback?code=abc");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "userId (state) missing" });
});

test("GET /api/auth/pinterest/callback links the account on success", async (t) => {
  t.mock.method(pinterestService, "handlePinterestOAuth", async () => ({
    access_token: "pin-token",
    token_type: "Bearer",
    scope: "boards:read,pins:read",
  }));
  t.mock.method(pinterestService, "getUserProfile", async () => ({
    username: "artlover",
    website_url: null,
    profile_image: "http://example.com/avatar.png",
  }));
  t.mock.method(dbService, "getPlatformId", async () => "platform-id");
  t.mock.method(dbService, "upsertSocialAccount", async () => ({
    id: "account-id",
    username: "artlover",
  }));
  t.mock.method(dbService, "upsertOAuthToken", async () => ({}));

  const response = await supertest(app).get(
    "/api/auth/pinterest/callback?code=auth-code&state=user-7",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "Pinterest account linked successfully",
    account: { id: "account-id", username: "artlover" },
  });
});

test("GET /api/auth/pinterest/callback returns 500 when the token exchange fails", async (t) => {
  t.mock.method(pinterestService, "handlePinterestOAuth", async () => {
    throw new Error("invalid code");
  });

  const response = await supertest(app).get(
    "/api/auth/pinterest/callback?code=bad-code&state=user-7",
  );

  assert.equal(response.status, 500);
  assert.equal(response.body.error, "invalid code");
});

test("POST /api/auth/pinterest/board rejects a request missing required fields", async () => {
  const response = await supertest(app).post("/api/auth/pinterest/board").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "accessToken and name are required" });
});

test("POST /api/auth/pinterest/board creates a board on success", async (t) => {
  t.mock.method(pinterestService, "createPinterestBoard", async () => ({ id: "board_1" }));

  const response = await supertest(app)
    .post("/api/auth/pinterest/board")
    .send({ accessToken: "token", name: "My Board" });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { success: true, board: { id: "board_1" } });
});

test("POST /api/auth/pinterest/board returns 500 when the service call fails", async (t) => {
  t.mock.method(pinterestService, "createPinterestBoard", async () => {
    throw new Error("pinterest api unreachable");
  });

  const response = await supertest(app)
    .post("/api/auth/pinterest/board")
    .send({ accessToken: "token", name: "My Board" });

  assert.equal(response.status, 500);
  assert.equal(response.body.error, "pinterest api unreachable");
});

test("POST /api/auth/pinterest/pins rejects a request missing required fields", async () => {
  const response = await supertest(app).post("/api/auth/pinterest/pins").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "accessToken and boardId are required" });
});

test("POST /api/auth/pinterest/pins creates a pin on success", async (t) => {
  t.mock.method(pinterestService, "createPinterestPin", async () => ({
    pin: { id: "pin_1" },
    imageUrl: "http://example.com/image.png",
  }));

  const response = await supertest(app)
    .post("/api/auth/pinterest/pins")
    .send({ accessToken: "token", boardId: "board_1" });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    pin: { id: "pin_1" },
    imageUrl: "http://example.com/image.png",
  });
});
