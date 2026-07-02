const express = require("express");
const multer = require("multer");
const youtubeController = require("./youtube.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/oauth", youtubeController.redirectToYouTube);
router.get("/callback", youtubeController.handleYouTubeCallback);
router.post("/upload", upload.single("file"), youtubeController.uploadVideo);
router.post("/refresh", youtubeController.refreshToken);

module.exports = router;
