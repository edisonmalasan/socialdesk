const express = require("express");
const router = express.Router();
const multer = require("multer");

const cloudinaryupload = require("../middleware/cloudinaryUpload");
const upload = multer({ storage: multer.memoryStorage() });
const instagramController = require("../controllers/instagram.controller");


router.get("/redirect", instagramController.redirectToInstagram);
router.get("/callback", instagramController.handleInstagramCallback);
router.post("/refresh", instagramController.refreshToken);

module.exports = router;