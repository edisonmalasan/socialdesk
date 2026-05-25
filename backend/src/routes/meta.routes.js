const express = require("express");
const router = express.Router();
const multer = require("multer");

const cloudinaryupload = require("../middleware/cloudinaryUpload");
const upload = multer({ storage: multer.memoryStorage() });
const facebookController = require("../controllers/meta.controller");

router.get("/redirect", facebookController.redirectToFacebook);
router.get("/callback", facebookController.handleFacebookCallback);
router.post("/post", facebookController.postMessage);
router.post("/post-photo", upload.single("source"), facebookController.postPhoto);
router.post("/schedule-photo", cloudinaryupload.single("source"),facebookController.schedulePhotoPost);
router.post("/instagram/post", cloudinaryupload.single("source"), facebookController.createInstagramPost);
router.post("/instagram/postreels", cloudinaryupload.single("source"), facebookController.createInstagramReelPost);
module.exports = router;