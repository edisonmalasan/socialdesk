const express = require("express");
const router = express.Router();
const saasAnalyticsController = require("./saas-analytics.controller");
const { authenticate, requireAdmin } = require("../../shared/middleware/auth.middleware");

/** SaaS-level analytics is an admin-only surface, so every route is gated. */
router.use(authenticate, requireAdmin);

router.get("/", saasAnalyticsController.getSaasAnalytics);

module.exports = router;
