const express = require("express");
const multer = require("multer");
const youtubeController = require("./youtube.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const { validate } = require("../../shared/middleware/validate.middleware");
const { uploadVideoSchema, refreshTokenSchema } = require("./youtube.schema");

router.get("/oauth", youtubeController.redirectToYouTube);
router.get("/callback", youtubeController.handleYouTubeCallback);
router.post("/upload", upload.single("file"), validate(uploadVideoSchema), youtubeController.uploadVideo);
router.post("/refresh", validate(refreshTokenSchema), youtubeController.refreshToken);

module.exports = router;
