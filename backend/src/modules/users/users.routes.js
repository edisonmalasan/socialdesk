const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const { authenticate, requireAdmin } = require("../../shared/middleware/auth.middleware");

/** Every route manages the SaaS-level user directory, so all are admin-only. */
router.use(authenticate, requireAdmin);

router.get("/", usersController.listUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.put("/:id", usersController.updateUser);
router.patch("/:id/disable", usersController.disableUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
