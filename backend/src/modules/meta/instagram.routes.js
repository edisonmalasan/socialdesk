const express = require("express");
const router = express.Router();
const multer = require("multer");

const cloudinaryupload = require("../media/upload.middleware");
const upload = multer({ storage: multer.memoryStorage() });
const instagramController = require("./instagram.controller");


router.get("/redirect", instagramController.redirectToInstagram);
router.get("/callback", instagramController.handleInstagramCallback);
router.post("/refresh", instagramController.refreshToken);

module.exports = router;
