const express = require("express");

const analyticsController = require("./analytics.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const { authenticate } = require("../../shared/middleware/auth.middleware");
const {
  analyticsSummaryQuerySchema,
  analyticsPostsQuerySchema,
  analyticsTopPostsQuerySchema,
  analyticsBestTimeQuerySchema,
  analyticsExportQuerySchema,
} = require("./analytics.schema");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/summary", validate(analyticsSummaryQuerySchema), analyticsController.getSummary);
router.get("/posts", validate(analyticsPostsQuerySchema), analyticsController.getPosts);
router.get("/top-posts", validate(analyticsTopPostsQuerySchema), analyticsController.getTopPosts);
router.get("/best-time", validate(analyticsBestTimeQuerySchema), analyticsController.getBestTime);
router.get("/export", validate(analyticsExportQuerySchema), analyticsController.exportAnalytics);

module.exports = router;
