const express = require("express");
const dashboardController = require("./dashboard.controller");
const { authenticate } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

// Require auth
router.use(authenticate);

router.get("/overview", dashboardController.getOverview);

module.exports = router;
