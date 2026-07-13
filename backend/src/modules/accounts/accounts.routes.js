const express = require("express");

const accountsController = require("./accounts.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const { authenticate } = require("../../shared/middleware/auth.middleware");
const {
  connectAccountSchema,
  accountIdParamSchema,
} = require("./accounts.schema");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/", accountsController.listAccounts);
router.post("/", validate(connectAccountSchema), accountsController.connectAccount);
router.delete("/:id", validate(accountIdParamSchema), accountsController.disconnectAccount);

module.exports = router;
