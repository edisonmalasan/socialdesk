const express = require("express");
const router = express.Router();
const socialConnectionsController = require("./social-connections.controller");
const { authenticate } = require("../../shared/middleware/auth.middleware");

// Protect all social connection read APIs
router.use(authenticate);

router.get("/platforms", socialConnectionsController.getPlatforms);
router.get("/accounts", socialConnectionsController.getConnectedAccounts);

module.exports = router;
