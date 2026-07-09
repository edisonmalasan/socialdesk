const { test } = require("node:test");
const assert = require("node:assert/strict");

require("../../test-utils/env");

const settingsRepository = require("./settings.repository");
const settingsService = require("./settings.service");

const USER_ID = "070f1c3d-ddd5-48d8-8e1c-6af1cce33164";

const dbUser = {
  id: USER_ID,
  email: "jane@example.com",
  full_name: "Jane Rivera",
  profile_url: "https://example.com/jane.png",
  timezone: "Asia/Manila",
  role: "user",
  status: "active",
};

const dbNotifications = {
  user_id: USER_ID,
  notification_post_success: true,
  notification_post_failure: false,
  notification_weekly_report: true,
};

test("getSettings loads profile and notification settings from the repository", async (t) => {
  t.mock.method(settingsRepository, "findUserById", async (userId) => {
    assert.equal(userId, USER_ID);
    return dbUser;
  });

  t.mock.method(settingsRepository, "getOrCreateNotificationSettings", async (userId) => {
    assert.equal(userId, USER_ID);
    return dbNotifications;
  });

  const result = await settingsService.getSettings(USER_ID);

  assert.deepEqual(result, {
    profile: {
      id: USER_ID,
      email: "jane@example.com",
      fullName: "Jane Rivera",
      firstName: "Jane",
      lastName: "Rivera",
      profileUrl: "https://example.com/jane.png",
      timezone: "Asia/Manila",
      role: "user",
      status: "active",
    },
    notifications: {
      postPublishingSuccess: true,
      postFailureAlerts: false,
      weeklyAnalyticsReport: true,
    },
  });
});

test("updateProfileSettings converts API profile fields into users table updates", async (t) => {
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

  const result = await settingsService.updateProfileSettings(USER_ID, {
    firstName: "Ada",
    lastName: "Lovelace",
    profileUrl: " https://example.com/ada.png ",
    timezone: "UTC",
  });

  assert.deepEqual(receivedUpdates, {
    full_name: "Ada Lovelace",
    profile_url: "https://example.com/ada.png",
    timezone: "UTC",
  });
  assert.equal(result.profile.fullName, "Ada Lovelace");
  assert.equal(result.profile.firstName, "Ada");
  assert.equal(result.profile.lastName, "Lovelace");
});

test("updateNotificationSettings rejects non-boolean notification values", async () => {
  await assert.rejects(
    () => settingsService.updateNotificationSettings(USER_ID, {
      weeklyAnalyticsReport: "yes",
    }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /weeklyAnalyticsReport must be a boolean/);
      return true;
    },
  );
});

test("updateProfileSettings rejects non-object payloads", async () => {
  await assert.rejects(
    () => settingsService.updateProfileSettings(USER_ID, null),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.equal(error.message, "Request body must be an object");
      return true;
    },
  );
});

test("getSettings reports a missing user", async (t) => {
  t.mock.method(settingsRepository, "findUserById", async () => null);

  await assert.rejects(
    () => settingsService.getSettings(USER_ID),
    (error) => {
      assert.equal(error.statusCode, 404);
      assert.equal(error.message, "User not found");
      return true;
    },
  );
});
