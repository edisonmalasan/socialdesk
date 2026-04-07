const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const facebookController = require("../controllers/facebook.controller");

router.get("/", facebookController.redirectToFacebook);
router.get("/callback", facebookController.handleFacebookCallback);
router.post("/post", facebookController.postMessage);
router.post("/post-photo", upload.single("source"), facebookController.postPhoto);

module.exports = router;