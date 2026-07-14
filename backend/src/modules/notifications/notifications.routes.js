const express = require("express");
const router = express.Router();

const { validate } = require("../../shared/middleware/validate.middleware");
const { authenticate } = require("../../shared/middleware/auth.middleware");
const {
  getNotificationsSchema,
  idParamSchema,
} = require("./notifications.schema");
const notificationsController = require("./notifications.controller");

// All routes require authentication
router.use(authenticate);

router.get("/", validate(getNotificationsSchema), notificationsController.getNotifications);
router.put("/mark-all-read", notificationsController.markAllAsRead);
router.put("/:id/read", validate(idParamSchema), notificationsController.markAsRead);
router.delete("/:id", validate(idParamSchema), notificationsController.deleteNotification);

module.exports = router;
