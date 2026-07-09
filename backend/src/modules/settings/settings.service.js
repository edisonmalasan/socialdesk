const settingsRepository = require("./settings.repository");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

const splitFullName = (fullName) => {
  const trimmed = (fullName || "").trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" "),
  };
};

const mapSettings = ({ user, notifications }) => {
  const { firstName, lastName } = splitFullName(user.full_name);

  return {
    profile: {
      id: user.id,
      email: user.email,
      fullName: user.full_name || "",
      firstName,
      lastName,
      profileUrl: user.profile_url || null,
      timezone: user.timezone || "UTC",
      role: user.role,
      status: user.status,
    },
    notifications: {
      postPublishingSuccess: Boolean(notifications.notification_post_success),
      postFailureAlerts: Boolean(notifications.notification_post_failure),
      weeklyAnalyticsReport: Boolean(notifications.notification_weekly_report),
    },
  };
};

const loadSettings = async (userId) => {
  const user = await settingsRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const notifications = await settingsRepository.getOrCreateNotificationSettings(userId);

  return mapSettings({ user, notifications });
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const ensureObjectPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationError("Request body must be an object");
  }

  return payload;
};

const normalizeNullableString = ({ value, fieldName, maxLength }) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName} must be ${maxLength} characters or less`);
  }

  return trimmed || null;
};

const buildFullName = (payload) => {
  if (hasOwn(payload, "fullName")) {
    return normalizeNullableString({
      value: payload.fullName,
      fieldName: "fullName",
      maxLength: 255,
    });
  }

  if (hasOwn(payload, "firstName") || hasOwn(payload, "lastName")) {
    const firstName = hasOwn(payload, "firstName")
      ? normalizeNullableString({
        value: payload.firstName,
        fieldName: "firstName",
        maxLength: 120,
      })
      : "";
    const lastName = hasOwn(payload, "lastName")
      ? normalizeNullableString({
        value: payload.lastName,
        fieldName: "lastName",
        maxLength: 120,
      })
      : "";

    return [firstName, lastName].filter(Boolean).join(" ") || null;
  }

  return undefined;
};

const normalizeProfileUpdates = (payload = {}) => {
  payload = ensureObjectPayload(payload);

  const updates = {};
  const fullName = buildFullName(payload);

  if (fullName !== undefined) {
    updates.full_name = fullName;
  }

  if (hasOwn(payload, "profileUrl")) {
    updates.profile_url = normalizeNullableString({
      value: payload.profileUrl,
      fieldName: "profileUrl",
      maxLength: 500,
    });
  }

  if (hasOwn(payload, "timezone")) {
    updates.timezone = normalizeNullableString({
      value: payload.timezone,
      fieldName: "timezone",
      maxLength: 50,
    }) || "UTC";
  }

  if (!Object.keys(updates).length) {
    throw new ValidationError("No profile settings were provided");
  }

  return updates;
};

const NOTIFICATION_FIELDS = {
  postPublishingSuccess: "notification_post_success",
  postFailureAlerts: "notification_post_failure",
  weeklyAnalyticsReport: "notification_weekly_report",
};

const normalizeNotificationUpdates = (payload = {}) => {
  payload = ensureObjectPayload(payload);

  const updates = {};

  for (const [apiField, dbField] of Object.entries(NOTIFICATION_FIELDS)) {
    if (!hasOwn(payload, apiField)) {
      continue;
    }

    if (typeof payload[apiField] !== "boolean") {
      throw new ValidationError(`${apiField} must be a boolean`);
    }

    updates[dbField] = payload[apiField];
  }

  if (!Object.keys(updates).length) {
    throw new ValidationError("No notification settings were provided");
  }

  return updates;
};

exports.getSettings = async (userId) => {
  return loadSettings(userId);
};

exports.updateProfileSettings = async (userId, payload) => {
  const updates = normalizeProfileUpdates(payload);
  const user = await settingsRepository.updateUserProfile(userId, updates);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const notifications = await settingsRepository.getOrCreateNotificationSettings(userId);
  return mapSettings({ user, notifications });
};

exports.updateNotificationSettings = async (userId, payload) => {
  const updates = normalizeNotificationUpdates(payload);
  const user = await settingsRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const notifications = await settingsRepository.updateNotificationSettings(userId, updates);
  return mapSettings({ user, notifications });
};

exports._private = {
  ValidationError,
  NotFoundError,
  mapSettings,
  ensureObjectPayload,
  normalizeNotificationUpdates,
  normalizeProfileUpdates,
  splitFullName,
};
