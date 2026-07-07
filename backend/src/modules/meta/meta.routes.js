const express = require("express");
const router = express.Router();
const multer = require("multer");

const cloudinaryupload = require("../media/upload.middleware");
const upload = multer({ storage: multer.memoryStorage() });
const facebookController = require("./facebook.controller");

const { validate } = require("../../shared/middleware/validate.middleware");
const { postMessageSchema, postMediaSchema, refreshTokenSchema } = require("./facebook.schema");

router.get("/redirect", facebookController.redirectToFacebook);
router.get("/callback", facebookController.handleFacebookCallback);

router.post("/post", validate(postMessageSchema), facebookController.postMessage);
router.post("/post-photo", upload.single("source"), validate(postMediaSchema), facebookController.postPhoto);
router.post("/schedule-photo", cloudinaryupload.single("source"), validate(postMediaSchema), facebookController.schedulePhotoPost);
router.post("/instagram/post", cloudinaryupload.single("source"), validate(postMediaSchema), facebookController.createInstagramPost);
router.post("/instagram/postreels", cloudinaryupload.single("source"), validate(postMediaSchema), facebookController.createInstagramReelPost);
router.post("/refresh", validate(refreshTokenSchema), facebookController.refreshToken);

module.exports = router;
