const notificationsRepository = require("./notifications.repository");

exports.getNotifications = async (userId, query) => {
  const { data, total } = await notificationsRepository.findAllByUser(userId, query);
  const unreadCount = await notificationsRepository.getUnreadCount(userId);

  return {
    notifications: data,
    total,
    unreadCount,
    page: query.page || 1,
    limit: query.limit || 20,
  };
};

exports.markAsRead = async (id, userId) => {
  return notificationsRepository.markAsRead(id, userId);
};

exports.markAllAsRead = async (userId) => {
  return notificationsRepository.markAllAsRead(userId);
};

exports.deleteNotification = async (id, userId) => {
  return notificationsRepository.deleteByIdAndUser(id, userId);
};

/**
 * Generic low-level creator. All event-specific emitters below use this.
 * Errors are swallowed so a notification failure never breaks the main flow.
 */
exports.createNotification = async ({ userId, type, title, message }) => {
  try {
    return await notificationsRepository.create({ userId, type, title, message });
  } catch (err) {
    console.error("[notifications] Failed to create notification:", err.message);
  }
};

// ---------------------------------------------------------------------------
// Typed event emitters — called by other backend modules
// ---------------------------------------------------------------------------

exports.emitPublishSuccess = async ({ userId, postTitle, platform }) => {
  const platformLabel = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "your platform";
  return exports.createNotification({
    userId,
    type: "success",
    title: "Post Published",
    message: `Your post${postTitle ? ` "${postTitle}"` : ""} was published successfully to ${platformLabel}.`,
  });
};

exports.emitPublishFailure = async ({ userId, postTitle, platform, reason }) => {
  const platformLabel = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "your platform";
  return exports.createNotification({
    userId,
    type: "alert",
    title: "Failed to Publish",
    message: `Failed to publish${postTitle ? ` "${postTitle}"` : ""} to ${platformLabel}.${reason ? ` Reason: ${reason}` : ""}`,
  });
};

exports.emitAccountConnected = async ({ userId, platform, username }) => {
  const platformLabel = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "an account";
  return exports.createNotification({
    userId,
    type: "success",
    title: "Account Connected",
    message: `${platformLabel} account${username ? ` @${username}` : ""} was successfully linked to SocialDesk.`,
  });
};

exports.emitAccountDisconnected = async ({ userId, platform, username }) => {
  const platformLabel = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "an account";
  return exports.createNotification({
    userId,
    type: "info",
    title: "Account Disconnected",
    message: `${platformLabel} account${username ? ` @${username}` : ""} has been disconnected from SocialDesk.`,
  });
};
