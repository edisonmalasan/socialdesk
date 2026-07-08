const express = require("express");
const router = express.Router();
const platformHealthController = require("./platform-health.controller");
const { authenticate, requireAdmin } = require("../../shared/middleware/auth.middleware");

/** Platform health is an admin-only SaaS surface, so every route is gated. */
router.use(authenticate, requireAdmin);

router.get("/", platformHealthController.getPlatformHealth);

module.exports = router;
