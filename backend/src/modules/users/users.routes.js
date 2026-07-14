const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const upload = require("../media/upload.middleware");
const { authenticate, requireAdmin } = require("../../shared/middleware/auth.middleware");

/**
 * Self-service avatar routes. Unlike the admin directory routes below, these let
 * any authenticated user manage their OWN avatar (scoped to req.user.id), so
 * they only require `authenticate` and must be registered before both the
 * admin gate and the `/:id` routes they would otherwise collide with.
 */
router.post("/avatar", authenticate, upload.single("avatar"), usersController.uploadAvatar);
router.delete("/avatar", authenticate, usersController.deleteAvatar);

/** Every remaining route manages the SaaS-level user directory, so all are admin-only. */
router.use(authenticate, requireAdmin);

router.get("/", usersController.listUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.put("/:id", usersController.updateUser);
router.patch("/:id/disable", usersController.disableUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
