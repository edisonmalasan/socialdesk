const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");

require("../../test-utils/env");

const settingsRepository = require("./settings.repository");
const app = require("../../app");

const USER_ID = "070f1c3d-ddd5-48d8-8e1c-6af1cce33164";

const signToken = () => {
  return jwt.sign({ id: USER_ID, role: "user" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const dbUser = {
  id: USER_ID,
  email: "jane@example.com",
  full_name: "Jane Rivera",
  profile_url: null,
  timezone: "Asia/Manila",
  role: "user",
  status: "active",
};

const dbNotifications = {
  user_id: USER_ID,
  notification_post_success: true,
  notification_post_failure: true,
  notification_weekly_report: false,
};

test("GET /api/settings requires authentication", async () => {
  const response = await supertest(app).get("/api/settings");

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { message: "Authentication required" });
});

test("GET /api/settings returns settings loaded from the database layer", async (t) => {
  t.mock.method(settingsRepository, "findUserById", async (userId) => {
    assert.equal(userId, USER_ID);
    return dbUser;
  });

  t.mock.method(settingsRepository, "getOrCreateNotificationSettings", async (userId) => {
    assert.equal(userId, USER_ID);
    return dbNotifications;
  });

  const response = await supertest(app)
    .get("/api/settings")
    .set("Authorization", `Bearer ${signToken()}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.profile.email, "jane@example.com");
  assert.equal(response.body.profile.firstName, "Jane");
  assert.equal(response.body.profile.timezone, "Asia/Manila");
  assert.deepEqual(response.body.notifications, {
    postPublishingSuccess: true,
    postFailureAlerts: true,
    weeklyAnalyticsReport: false,
  });
});

test("GET /api/settings accepts the existing auth-token cookie", async (t) => {
  t.mock.method(settingsRepository, "findUserById", async () => dbUser);
  t.mock.method(settingsRepository, "getOrCreateNotificationSettings", async () => dbNotifications);

  const response = await supertest(app)
    .get("/api/settings")
    .set("Cookie", [`auth-token=${encodeURIComponent(signToken())}`]);

  assert.equal(response.status, 200);
  assert.equal(response.body.profile.id, USER_ID);
});

test("PUT /api/settings/profile updates profile fields through the database layer", async (t) => {
  let receivedUpdates;

  t.mock.method(settingsRepository, "updateUserProfile", async (userId, updates) => {
    assert.equal(userId, USER_ID);
    receivedUpdates = updates;
    return {
      ...dbUser,
      full_name: updates.full_name,
      profile_url: updates.profile_url,
      timezone: updates.timezone,
    };
  });

  t.mock.method(settingsRepository, "getOrCreateNotificationSettings", async () => dbNotifications);

  const response = await supertest(app)
    .put("/api/settings/profile")
    .set("Authorization", `Bearer ${signToken()}`)
    .send({
      firstName: "Ada",
      lastName: "Lovelace",
      profileUrl: "https://example.com/ada.png",
      timezone: "UTC",
    });

  assert.equal(response.status, 200);
  assert.deepEqual(receivedUpdates, {
    full_name: "Ada Lovelace",
    profile_url: "https://example.com/ada.png",
    timezone: "UTC",
  });
  assert.equal(response.body.profile.fullName, "Ada Lovelace");
});

test("PUT /api/settings/notifications validates notification payloads", async () => {
  const response = await supertest(app)
    .put("/api/settings/notifications")
    .set("Authorization", `Bearer ${signToken()}`)
    .send({ weeklyAnalyticsReport: "yes" });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    message: "weeklyAnalyticsReport must be a boolean",
  });
});

test("PUT /api/settings/notifications upserts notification fields", async (t) => {
  let receivedUpdates;

  t.mock.method(settingsRepository, "findUserById", async (userId) => {
    assert.equal(userId, USER_ID);
    return dbUser;
  });

  t.mock.method(settingsRepository, "updateNotificationSettings", async (userId, updates) => {
    assert.equal(userId, USER_ID);
    receivedUpdates = updates;
    return {
      ...dbNotifications,
      ...updates,
    };
  });

  const response = await supertest(app)
    .put("/api/settings/notifications")
    .set("Authorization", `Bearer ${signToken()}`)
    .send({
      postPublishingSuccess: false,
      postFailureAlerts: true,
      weeklyAnalyticsReport: true,
    });

  assert.equal(response.status, 200);
  assert.deepEqual(receivedUpdates, {
    notification_post_success: false,
    notification_post_failure: true,
    notification_weekly_report: true,
  });
  assert.deepEqual(response.body.notifications, {
    postPublishingSuccess: false,
    postFailureAlerts: true,
    weeklyAnalyticsReport: true,
  });
});
