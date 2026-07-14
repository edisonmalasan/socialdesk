const notificationsService = require("./notifications.service");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, page, limit } = req.query;

    const data = await notificationsService.getNotifications(userId, {
      type,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    return successResponse(res, data);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await notificationsService.markAsRead(id, userId);
    return successResponse(res, notification);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await notificationsService.markAllAsRead(userId);
    return successResponse(res, { message: "All notifications marked as read." });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await notificationsService.deleteNotification(id, userId);
    return successResponse(res, { message: "Notification deleted." });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
