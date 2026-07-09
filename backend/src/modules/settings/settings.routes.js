const express = require("express");

const settingsController = require("./settings.controller");
const { requireAuth } = require("../../shared/auth.middleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", settingsController.getSettings);
router.put("/profile", settingsController.updateProfileSettings);
router.put("/notifications", settingsController.updateNotificationSettings);

module.exports = router;
