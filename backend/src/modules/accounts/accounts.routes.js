const express = require("express");
const router = express.Router();
const accountsController = require("./accounts.controller");
const { authenticate } = require("../../shared/middleware/auth.middleware");
const { validate } = require("../../shared/middleware/validate.middleware");
const {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
} = require("./accounts.schema");

/** Every route is scoped to the authenticated user's own connected accounts. */
router.use(authenticate);

router.get("/", accountsController.listAccounts);
router.post("/", validate(createAccountSchema), accountsController.createAccount);
router.patch("/:id", validate(updateAccountSchema), accountsController.updateAccount);
router.delete("/:id", validate(accountIdSchema), accountsController.disconnectAccount);

module.exports = router;
