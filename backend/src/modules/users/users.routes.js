const express = require("express");
const multer = require("multer");
const router = express.Router();
const usersController = require("./users.controller");
const usersService = require("./users.service");
const { errorResponse } = require("../../shared/utils/response.util");
const { authenticate, requireAdmin } = require("../../shared/middleware/auth.middleware");

/**
 * Dedicated avatar upload: enforce the image type and size cap at the multer
 * layer so oversized or non-image files are rejected while streaming, before
 * being buffered into memory. The service re-checks both as defense-in-depth.
 */
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: usersService.MAX_AVATAR_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    cb(new Error("Avatar must be an image file"));
  },
});

/** Translates multer's errors into our JSON 400 envelope instead of letting
 *  Express fall back to its default HTML error response. */
const uploadAvatar = (req, res, next) => {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE"
        ? "Avatar must be 5 MB or smaller"
        : err.message || "Invalid avatar upload";
      return errorResponse(res, message, 400);
    }
    next();
  });
};


router.post("/avatar", authenticate, uploadAvatar, usersController.uploadAvatar);
router.delete("/avatar", authenticate, usersController.deleteAvatar);

router.get(
  "/me",
  authenticate,
  usersController.getCurrentUser,
);

router.put(
  "/me",
  authenticate,
  usersController.updateCurrentUser,
);

router.put(
  "/me/password",
  authenticate,
  usersController.changePassword,
);

router.use(authenticate, requireAdmin);

router.get("/", usersController.listUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.put("/:id", usersController.updateUser);
router.patch("/:id/disable", usersController.disableUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
