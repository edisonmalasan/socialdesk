const { test } = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");

require("../../test-utils/env");

const youtubeService = require("./youtube.service");
const dbService = require("../social-connections/social-connections.service");
const app = require("../../app");

// --- OAuth redirect ---

test("GET /api/auth/youtube/oauth requires a userId", async () => {
  const response = await supertest(app).get("/api/auth/youtube/oauth");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "userId is required" });
});

test("GET /api/auth/youtube/oauth redirects to the Google OAuth screen", async () => {
  const response = await supertest(app).get("/api/auth/youtube/oauth?userId=7");

  assert.equal(response.status, 302);
  assert.match(response.headers.location, /accounts\.google\.com/);
  assert.match(response.headers.location, new RegExp(`client_id=${process.env.GOOGLE_CLIENT_ID}`));
  assert.match(response.headers.location, /state=7/);
});

// --- OAuth callback ---

test("GET /api/auth/youtube/callback requires an authorization code", async () => {
  const response = await supertest(app).get("/api/auth/youtube/callback?state=7");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Authorization code missing" });
});

test("GET /api/auth/youtube/callback requires userId (state)", async () => {
  const response = await supertest(app).get("/api/auth/youtube/callback?code=abc");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "userId (state) missing" });
});

test("GET /api/auth/youtube/callback links the channel on success", async (t) => {
  t.mock.method(youtubeService, "handleYouTubeOAuth", async () => ({
    access_token: "ya29.token",
    refresh_token: "refresh-token",
    token_type: "Bearer",
    scope: "https://www.googleapis.com/auth/youtube.upload",
    expiry_date: 1234567890000,
  }));
  t.mock.method(youtubeService, "getChannelProfile", async () => ({
    channelId: "UCtest123",
    title: "Test Channel",
    customUrl: "@testchannel",
    thumbnailUrl: "http://example.com/avatar.jpg",
  }));
  t.mock.method(dbService, "getPlatformId", async () => "platform-id");
  t.mock.method(dbService, "upsertSocialAccount", async () => ({
    id: "account-id",
    username: "@testchannel",
  }));
  t.mock.method(dbService, "upsertOAuthToken", async () => ({}));

  const response = await supertest(app).get(
    "/api/auth/youtube/callback?code=auth-code&state=user-7",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "YouTube channel linked successfully",
    account: { id: "account-id", username: "@testchannel" },
  });
});

test("GET /api/auth/youtube/callback returns 500 when token exchange fails", async (t) => {
  t.mock.method(youtubeService, "handleYouTubeOAuth", async () => {
    throw new Error("invalid_grant");
  });

  const response = await supertest(app).get(
    "/api/auth/youtube/callback?code=bad-code&state=user-7",
  );

  assert.equal(response.status, 500);
  assert.equal(response.body.error, "invalid_grant");
});

// --- Video upload ---

test("POST /api/auth/youtube/upload rejects a request missing accessToken and title", async () => {
  const response = await supertest(app).post("/api/auth/youtube/upload").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "accessToken and title are required" });
});

test("POST /api/auth/youtube/upload rejects a request missing a video file", async () => {
  const response = await supertest(app)
    .post("/api/auth/youtube/upload")
    .field("accessToken", "ya29.token")
    .field("title", "My Video");

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Video file is required" });
});

test("POST /api/auth/youtube/upload uploads a video on success", async (t) => {
  t.mock.method(youtubeService, "uploadVideo", async () => ({
    id: "video-id-123",
    snippet: { title: "My Video" },
    status: { privacyStatus: "public" },
  }));

  const response = await supertest(app)
    .post("/api/auth/youtube/upload")
    .field("accessToken", "ya29.token")
    .field("title", "My Video")
    .attach("file", Buffer.from("fake-video-content"), {
      filename: "video.mp4",
      contentType: "video/mp4",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.video.id, "video-id-123");
});

test("POST /api/auth/youtube/upload returns 500 when the upload fails", async (t) => {
  t.mock.method(youtubeService, "uploadVideo", async () => {
    throw new Error("quota exceeded");
  });

  const response = await supertest(app)
    .post("/api/auth/youtube/upload")
    .field("accessToken", "ya29.token")
    .field("title", "My Video")
    .attach("file", Buffer.from("fake-video-content"), {
      filename: "video.mp4",
      contentType: "video/mp4",
    });

  assert.equal(response.status, 500);
  assert.equal(response.body.error, "quota exceeded");
});

// --- Token refresh ---

test("POST /api/auth/youtube/refresh requires a socialAccountId", async () => {
  const response = await supertest(app).post("/api/auth/youtube/refresh").send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "socialAccountId is required" });
});

test("POST /api/auth/youtube/refresh refreshes the token on success", async (t) => {
  t.mock.method(youtubeService, "refreshOAuthToken", async () => ({
    access_token: "new-access-token",
  }));

  const response = await supertest(app)
    .post("/api/auth/youtube/refresh")
    .send({ socialAccountId: "account-1" });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "Token refreshed successfully",
    token: { access_token: "new-access-token" },
  });
});

test("POST /api/auth/youtube/refresh returns 500 when no refresh token is available", async (t) => {
  t.mock.method(youtubeService, "refreshOAuthToken", async () => {
    throw new Error("No refresh token available for this account");
  });

  const response = await supertest(app)
    .post("/api/auth/youtube/refresh")
    .send({ socialAccountId: "account-1" });

  assert.equal(response.status, 500);
  assert.equal(response.body.error, "No refresh token available for this account");
});
