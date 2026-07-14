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
