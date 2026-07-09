const settingsService = require("./settings.service");

const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Settings API error:", error.message || error);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message,
  });
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings(req.user.id);
    res.json(settings);
  } catch (error) {
    sendError(res, error);
  }
};

exports.updateProfileSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateProfileSettings(req.user.id, req.body);
    res.json(settings);
  } catch (error) {
    sendError(res, error);
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateNotificationSettings(req.user.id, req.body);
    res.json(settings);
  } catch (error) {
    sendError(res, error);
  }
};
