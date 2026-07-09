const express = require("express");
const router = express.Router();
const accountAdminController = require("./account-admin.controller");
const { authenticate, requireAdmin } = require("../../shared/middleware/auth.middleware");

/** Account administration is an admin-only SaaS surface, so every route is gated. */
router.use(authenticate, requireAdmin);

router.get("/", accountAdminController.getAccountAdmin);

module.exports = router;
