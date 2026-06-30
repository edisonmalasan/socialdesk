const { test } = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const supertest = require("supertest");

require("../../test-utils/env");

const facebookService = require("./meta.service");
const dbService = require("../social-connections/social-connections.service");
const app = require("../../app");

const GRAPH_URL = "https://graph.facebook.com/v25.0";

test("GET /api/auth/facebook/redirect requires a userId", async () => {
  const response = await supertest(app).get("/api/auth/facebook/redirect");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Missing userId" });
});

test("GET /api/auth/facebook/redirect redirects to the Facebook OAuth screen", async () => {
  const response = await supertest(app).get("/api/auth/facebook/redirect?userId=42");

  assert.equal(response.status, 302);
  assert.match(response.headers.location, new RegExp(`client_id=${process.env.FB_APP_ID}`));
  assert.match(response.headers.location, /state=42/);
});

test("POST /api/auth/facebook/post rejects a request missing required fields", async (t) => {
  const response = await supertest(app).post("/api/auth/facebook/post").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { success: false, message: "Missing parameters" });
});

test("POST /api/auth/facebook/post creates a page post on success", async (t) => {
  t.mock.method(facebookService, "postToPage", async () => ({ id: "post_123" }));

  const response = await supertest(app).post("/api/auth/facebook/post").send({
    pageId: "page_1",
    pageAccessToken: "page-token",
    message: "hello world",
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { success: true, data: { id: "post_123" } });
});

test("POST /api/auth/facebook/post returns 500 when the service call fails", async (t) => {
  t.mock.method(facebookService, "postToPage", async () => {
    throw new Error("graph api unreachable");
  });

  const response = await supertest(app).post("/api/auth/facebook/post").send({
    pageId: "page_1",
    pageAccessToken: "page-token",
    message: "hello world",
  });

  assert.equal(response.status, 500);
  assert.equal(response.body.error, "graph api unreachable");
});

test("POST /api/auth/facebook/refresh requires a socialAccountId", async () => {
  const response = await supertest(app).post("/api/auth/facebook/refresh").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "socialAccountId is required" });
});

test("POST /api/auth/facebook/refresh refreshes the token on success", async (t) => {
  t.mock.method(facebookService, "refreshOAuthToken", async () => ({ access_token: "new-token" }));

  const response = await supertest(app)
    .post("/api/auth/facebook/refresh")
    .send({ socialAccountId: "account-1" });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "Token refreshed successfully",
    token: { access_token: "new-token" },
  });
});

test("GET /api/auth/facebook/callback links the page and Instagram account, then redirects", async (t) => {
  t.mock.method(facebookService, "handleOAuth", async () => ({ user_access_token: "short-token" }));
  t.mock.method(facebookService, "getLongLivedToken", async () => "long-token");
  t.mock.method(dbService, "getPlatformId", async () => "platform-id");
  t.mock.method(dbService, "upsertSocialAccount", async () => ({ id: "account-id" }));
  t.mock.method(dbService, "upsertOAuthToken", async () => ({}));
  t.mock.method(axios, "get", async (url) => {
    if (url === `${GRAPH_URL}/me/accounts`) {
      return { data: { data: [{ id: "page_123", name: "Test Page", access_token: "page-token" }] } };
    }
    if (url === `${GRAPH_URL}/page_123`) {
      return { data: { instagram_business_account: { id: "ig_123" }, name: "Test Page" } };
    }
    throw new Error(`Unexpected axios.get url: ${url}`);
  });

  const response = await supertest(app).get(
    "/api/auth/facebook/callback?code=auth-code&state=user-42",
  );

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /^http:\/\/localhost:3000\/accounts\?connected=facebook/);
  assert.match(response.headers.location, /name=Test%20Page/);
  assert.match(response.headers.location, /igId=ig_123/);
});

test("GET /api/auth/facebook/callback redirects with an error state when OAuth fails", async (t) => {
  t.mock.method(facebookService, "handleOAuth", async () => {
    throw new Error("invalid code");
  });

  const response = await supertest(app).get(
    "/api/auth/facebook/callback?code=bad-code&state=user-42",
  );

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, "http://localhost:3000/accounts?error=facebook");
});
